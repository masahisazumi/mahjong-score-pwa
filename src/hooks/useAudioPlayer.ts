import { useRef, useCallback, useEffect } from 'react'
import { Settings, PitchLevel } from '../types'

// Pitch shift multipliers
const pitchMultipliers: Record<PitchLevel, number> = {
  low: 0.85,
  normal: 1.0,
  high: 1.15,
}

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

  // Play audio file using HTML5 Audio (reliable on iOS/Android)
  const playAudio = useCallback((url: string) => {
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
    const rate = settingsRef.current.playbackSpeed * pitchMultipliers[settingsRef.current.pitch]
    audio.playbackRate = rate

    // Disable preservesPitch so playbackRate also changes pitch
    // (matches the previous Web Audio API behavior)
    const a = audio as any
    if ('preservesPitch' in audio) (audio as any).preservesPitch = false
    if ('mozPreservesPitch' in a) a.mozPreservesPitch = false
    if ('webkitPreservesPitch' in a) a.webkitPreservesPitch = false

    currentAudio.current = audio

    // play() returns a promise - must be called synchronously from user gesture
    audio.play().catch(err => {
      console.error('Audio play failed:', err)
    })

    audio.onended = () => {
      if (currentAudio.current === audio) {
        currentAudio.current = null
      }
    }
  }, [])

  // Speak Japanese text using SpeechSynthesis (for honba announcements)
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
    utterance.rate = settingsRef.current.playbackSpeed
    utterance.volume = settingsRef.current.volume
    utterance.pitch = pitchMultipliers[settingsRef.current.pitch]

    const voice = findJapaneseVoice()
    if (voice) utterance.voice = voice

    synth.speak(utterance)
  }, [])

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

// Generate audio URL based on score
export function getAudioUrl(scoreId: string, isRon: boolean, isParent: boolean): string {
  const type = isRon ? 'ron' : 'tsumo'
  const player = isParent ? 'parent' : 'child'
  return `/audio/${player}_${type}_${scoreId}.mp3`
}
