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

// --- Web Audio API singleton ---
let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    audioCtx = new AudioCtx()
  }
  return audioCtx
}

// Ensure AudioContext is running (handles iOS suspend after backgrounding)
function ensureAudioContextRunning(): void {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended' || (ctx.state as string) === 'interrupted') {
    ctx.resume()
  }
}

// Decoded audio buffer cache (avoids re-fetching & re-decoding)
const bufferCache = new Map<string, AudioBuffer>()

export function useAudioPlayer(settings: Settings) {
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null)
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
  useEffect(() => {
    let unlocked = false
    const unlock = () => {
      if (unlocked) return
      const ctx = getAudioContext()
      if (ctx.state === 'suspended') {
        ctx.resume()
      }
      // Play a silent buffer to fully unlock iOS audio session
      const buf = ctx.createBuffer(1, 1, 22050)
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.connect(ctx.destination)
      src.start(0)
      unlocked = true
      // Remove listeners after successful unlock
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

  // Stop currently playing AudioBufferSourceNode
  const stopCurrentSource = useCallback(() => {
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop() } catch { /* already stopped */ }
      currentSourceRef.current = null
    }
  }, [])

  // Speak Japanese text using SpeechSynthesis
  const speakText = useCallback((text: string) => {
    const synth = window.speechSynthesis
    if (!synth) return

    stopCurrentSource()
    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ja-JP'
    utterance.volume = settingsRef.current.volume

    // Pitch: use numeric value directly (0.5 - 2.0)
    utterance.pitch = settingsRef.current.pitch
    // Rate: user speed × base TTS rate for brisk announcements
    utterance.rate = settingsRef.current.playbackSpeed * TTS_BASE_RATE

    const voice = findJapaneseVoice()
    if (voice) utterance.voice = voice

    synth.speak(utterance)
  }, [stopCurrentSource])

  // Play audio file via Web Audio API with TTS fallback
  const playAudio = useCallback((url: string, fallbackText?: string) => {
    // Stop any current playback
    stopCurrentSource()
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    const ctx = getAudioContext()
    // Resume if suspended (e.g. after app was backgrounded on iOS)
    ensureAudioContextRunning()

    const playBuffer = (buffer: AudioBuffer) => {
      const source = ctx.createBufferSource()
      source.buffer = buffer

      // Playback rate (also shifts pitch since we want pitch change)
      source.playbackRate.value = settingsRef.current.playbackSpeed * settingsRef.current.pitch

      // Volume via GainNode
      const gain = ctx.createGain()
      gain.gain.value = settingsRef.current.volume

      source.connect(gain)
      gain.connect(ctx.destination)

      source.onended = () => {
        if (currentSourceRef.current === source) {
          currentSourceRef.current = null
        }
      }

      currentSourceRef.current = source
      source.start(0)
    }

    // Use cached buffer if available
    const cached = bufferCache.get(url)
    if (cached) {
      playBuffer(cached)
      return
    }

    // Fetch audio data (from Service Worker cache when offline) and decode
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.arrayBuffer()
      })
      .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        bufferCache.set(url, audioBuffer)
        playBuffer(audioBuffer)
      })
      .catch(err => {
        console.error('Web Audio playback failed:', err)
        // Fallback to TTS when audio fetch/decode fails
        if (fallbackText) {
          speakText(fallbackText)
        }
      })
  }, [speakText, stopCurrentSource])

  // Stop currently playing audio and speech
  const stopAudio = useCallback(() => {
    stopCurrentSource()
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [stopCurrentSource])

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
