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

export function useAudioPlayer(settings: Settings) {
  const currentAudio = useRef<HTMLAudioElement | null>(null)
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

  // Speak Japanese text using SpeechSynthesis
  const speakText = useCallback((text: string) => {
    const synth = window.speechSynthesis
    if (!synth) return

    // Stop any current audio/speech
    if (currentAudio.current) {
      currentAudio.current.pause()
      currentAudio.current.currentTime = 0
      currentAudio.current = null
    }
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
  }, [])

  // Play audio file with TTS fallback for offline
  const playAudio = useCallback((url: string, fallbackText?: string) => {
    // Stop any currently playing audio/speech
    if (currentAudio.current) {
      currentAudio.current.pause()
      currentAudio.current.currentTime = 0
      currentAudio.current = null
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    const audio = new Audio(url)
    audio.volume = settingsRef.current.volume
    // For HTML5 Audio: pitch is simulated via playbackRate (higher = faster + higher pitch)
    const rate = settingsRef.current.playbackSpeed * settingsRef.current.pitch
    audio.playbackRate = rate

    // Disable preservesPitch so playbackRate also changes pitch
    const a = audio as any
    if ('preservesPitch' in audio) (audio as any).preservesPitch = false
    if ('mozPreservesPitch' in a) a.mozPreservesPitch = false
    if ('webkitPreservesPitch' in a) a.webkitPreservesPitch = false

    currentAudio.current = audio

    // play() returns a promise - must be called synchronously from user gesture
    audio.play().catch(err => {
      console.error('Audio play failed:', err)
      // Fallback to TTS when audio fails (e.g. offline without cache)
      if (fallbackText) {
        speakText(fallbackText)
      }
    })

    audio.onended = () => {
      if (currentAudio.current === audio) {
        currentAudio.current = null
      }
    }
  }, [speakText])

  // Stop currently playing audio and speech
  const stopAudio = useCallback(() => {
    if (currentAudio.current) {
      currentAudio.current.pause()
      currentAudio.current.currentTime = 0
      currentAudio.current = null
    }
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
