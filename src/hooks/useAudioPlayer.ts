import { useRef, useCallback, useEffect } from 'react'
import { Settings } from '../types'

// Base TTS rate: SpeechSynthesis default 1.0 is too slow for mahjong score announcements.
// Pre-recorded MP3s are spoken at a brisk pace, so TTS base rate needs to be higher to match.
const TTS_BASE_RATE = 1.4

// Cached Japanese voice for SpeechSynthesis
let cachedJapaneseVoice: SpeechSynthesisVoice | null = null
let isPreferredVoice = false

// Preferred male Japanese voices (in priority order)
const PREFERRED_MALE_VOICES = ['Otoya', 'Hattori', 'Takumi']

function findJapaneseVoice(): SpeechSynthesisVoice | null {
  // If already found a preferred (male) voice, keep it
  if (cachedJapaneseVoice && isPreferredVoice) return cachedJapaneseVoice

  const synth = window.speechSynthesis
  if (!synth) return cachedJapaneseVoice

  const voices = synth.getVoices()
  if (voices.length === 0) return cachedJapaneseVoice

  // Search for preferred male voices first
  for (const name of PREFERRED_MALE_VOICES) {
    const voice = voices.find(v => v.name.includes(name))
    if (voice) {
      cachedJapaneseVoice = voice
      isPreferredVoice = true
      return voice
    }
  }

  // Fallback: any Japanese voice (may be female)
  if (!cachedJapaneseVoice) {
    const japanese = voices.find(v => v.lang.startsWith('ja'))
    if (japanese) cachedJapaneseVoice = japanese
  }
  return cachedJapaneseVoice
}

// --- Audio pipeline ---
// HTMLAudioElement for reliable playback on all devices.
// AudioContext used ONLY for iOS autoplay unlock (silent buffer on first gesture).
// NOTE: createMediaElementSource is intentionally NOT used.
// Routing HTMLAudioElement through AudioContext causes silent failures on iPad
// when AudioContext is suspended — audio is dropped with no error.
let audioCtx: AudioContext | null = null
let sharedAudio: HTMLAudioElement | null = null

function getOrCreateAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    audioCtx = new AudioCtx()
  }
  return audioCtx
}

function getSharedAudio(): HTMLAudioElement {
  if (!sharedAudio) {
    sharedAudio = new Audio()
  }
  return sharedAudio
}

export function useAudioPlayer(settings: Settings) {
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  // Pre-load SpeechSynthesis voices (async on many browsers)
  useEffect(() => {
    findJapaneseVoice()
    if (window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', findJapaneseVoice)
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', findJapaneseVoice)
      }
    }
  }, [])

  // Unlock AudioContext on first user gesture (required for iOS)
  // This activates the audio session so HTMLAudioElement playback works reliably.
  useEffect(() => {
    let unlocked = false
    const unlock = () => {
      if (unlocked) return
      const ctx = getOrCreateAudioContext()
      if (ctx.state === 'suspended') {
        ctx.resume()
      }
      // Play silent buffer to fully unlock iOS audio session
      const buf = ctx.createBuffer(1, 1, 22050)
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.connect(ctx.destination)
      src.start(0)

      // Also prime the HTMLAudioElement with a silent play
      // This ensures iOS allows subsequent play() calls
      const audio = getSharedAudio()
      audio.muted = true
      audio.play().then(() => {
        audio.pause()
        audio.muted = false
        audio.currentTime = 0
      }).catch(() => {
        audio.muted = false
      })

      unlocked = true
      document.removeEventListener('touchstart', unlock, true)
      document.removeEventListener('touchend', unlock, true)
      document.removeEventListener('mousedown', unlock, true)
    }
    document.addEventListener('touchstart', unlock, true)
    document.addEventListener('touchend', unlock, true)
    document.addEventListener('mousedown', unlock, true)
    return () => {
      document.removeEventListener('touchstart', unlock, true)
      document.removeEventListener('touchend', unlock, true)
      document.removeEventListener('mousedown', unlock, true)
    }
  }, [])

  // Speak Japanese text using SpeechSynthesis
  const speakText = useCallback((text: string) => {
    const synth = window.speechSynthesis
    if (!synth) return

    // Stop current audio
    const audio = getSharedAudio()
    audio.pause()
    audio.currentTime = 0
    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ja-JP'
    utterance.volume = settingsRef.current.volume
    utterance.pitch = settingsRef.current.pitch
    utterance.rate = settingsRef.current.playbackSpeed * TTS_BASE_RATE

    const voice = findJapaneseVoice()
    if (voice) utterance.voice = voice

    synth.speak(utterance)
  }, [])

  // Play audio file via HTMLAudioElement (direct output, no AudioContext routing)
  const playAudio = useCallback((url: string, fallbackText?: string) => {
    const audio = getSharedAudio()

    // Stop current playback
    audio.pause()
    audio.currentTime = 0
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    // Keep AudioContext alive to maintain iOS audio session
    const ctx = getOrCreateAudioContext()
    if (ctx.state === 'suspended' || (ctx.state as string) === 'interrupted') {
      ctx.resume()
    }

    // Configure playback
    audio.volume = settingsRef.current.volume
    const rate = settingsRef.current.playbackSpeed * settingsRef.current.pitch
    audio.playbackRate = rate

    // Disable preservesPitch so playbackRate also shifts pitch
    const a = audio as any
    if ('preservesPitch' in audio) a.preservesPitch = false
    if ('mozPreservesPitch' in a) a.mozPreservesPitch = false
    if ('webkitPreservesPitch' in a) a.webkitPreservesPitch = false

    // Set source and play (synchronous from user gesture)
    audio.src = url
    audio.play().catch(err => {
      console.error('Audio play failed:', err)
      if (fallbackText) {
        speakText(fallbackText)
      }
    })
  }, [speakText])

  // Stop currently playing audio and speech
  const stopAudio = useCallback(() => {
    const audio = getSharedAudio()
    audio.pause()
    audio.currentTime = 0
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [])

  return {
    playAudio,
    stopAudio,
    speakText,
  }
}

// Generate audio URL based on score and honba
export function getAudioUrl(scoreId: string, isRon: boolean, isParent: boolean, honba: number = 0): string {
  const type = isRon ? 'ron' : 'tsumo'
  const player = isParent ? 'parent' : 'child'
  const honbaSuffix = honba > 0 ? `_h${honba}` : ''
  return `/audio/${player}_${type}_${scoreId}${honbaSuffix}.mp3`
}
