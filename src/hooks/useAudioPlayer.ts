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
  const currentBlobUrl = useRef<string | null>(null)
  const playIdRef = useRef(0)
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

  // Clean up current playback and blob URL
  const stopCurrent = useCallback(() => {
    if (currentAudio.current) {
      currentAudio.current.pause()
      currentAudio.current.currentTime = 0
      currentAudio.current = null
    }
    if (currentBlobUrl.current) {
      URL.revokeObjectURL(currentBlobUrl.current)
      currentBlobUrl.current = null
    }
  }, [])

  // Speak Japanese text using SpeechSynthesis
  const speakText = useCallback((text: string) => {
    const synth = window.speechSynthesis
    if (!synth) return

    stopCurrent()
    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ja-JP'
    utterance.volume = settingsRef.current.volume
    utterance.pitch = settingsRef.current.pitch
    utterance.rate = settingsRef.current.playbackSpeed * TTS_BASE_RATE

    const voice = findJapaneseVoice()
    if (voice) utterance.voice = voice

    synth.speak(utterance)
  }, [stopCurrent])

  // Play audio file via fetch + Blob URL (bypasses iOS range request issues with SW cache)
  const playAudio = useCallback((url: string, fallbackText?: string) => {
    stopCurrent()
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    // Track play ID to handle rapid button presses (ignore stale fetches)
    const thisPlayId = ++playIdRef.current

    // Fetch audio data from Service Worker cache, then play via Blob URL.
    // This avoids the iOS Safari issue where HTMLAudioElement sends Range requests
    // that the SW precache handler cannot properly respond to (returns 200 instead of 206).
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.blob()
      })
      .then(blob => {
        // Ignore if a newer play was triggered while fetching
        if (thisPlayId !== playIdRef.current) return

        const blobUrl = URL.createObjectURL(blob)
        currentBlobUrl.current = blobUrl

        const audio = new Audio(blobUrl)
        audio.volume = settingsRef.current.volume
        const rate = settingsRef.current.playbackSpeed * settingsRef.current.pitch
        audio.playbackRate = rate

        // Disable preservesPitch so playbackRate also changes pitch
        const a = audio as any
        if ('preservesPitch' in audio) a.preservesPitch = false
        if ('mozPreservesPitch' in a) a.mozPreservesPitch = false
        if ('webkitPreservesPitch' in a) a.webkitPreservesPitch = false

        currentAudio.current = audio

        audio.onended = () => {
          if (currentAudio.current === audio) {
            currentAudio.current = null
          }
          URL.revokeObjectURL(blobUrl)
          if (currentBlobUrl.current === blobUrl) {
            currentBlobUrl.current = null
          }
        }

        return audio.play()
      })
      .catch(err => {
        console.error('Audio play failed:', err)
        if (thisPlayId === playIdRef.current && fallbackText) {
          speakText(fallbackText)
        }
      })
  }, [speakText, stopCurrent])

  // Stop currently playing audio and speech
  const stopAudio = useCallback(() => {
    stopCurrent()
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [stopCurrent])

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
