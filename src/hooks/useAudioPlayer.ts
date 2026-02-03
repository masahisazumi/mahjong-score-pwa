import { useRef, useCallback, useEffect } from 'react'
import { Settings, PitchLevel } from '../types'

// Audio context for advanced playback control
let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

// Pitch shift multipliers
const pitchMultipliers: Record<PitchLevel, number> = {
  low: 0.85,
  normal: 1.0,
  high: 1.15,
}

export function useAudioPlayer(settings: Settings) {
  const audioBufferCache = useRef<Map<string, AudioBuffer>>(new Map())
  const currentSource = useRef<AudioBufferSourceNode | null>(null)

  // Preload audio files
  const preloadAudio = useCallback(async (urls: string[]) => {
    const ctx = getAudioContext()

    await Promise.all(
      urls.map(async (url) => {
        if (audioBufferCache.current.has(url)) return

        try {
          const response = await fetch(url)
          const arrayBuffer = await response.arrayBuffer()
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
          audioBufferCache.current.set(url, audioBuffer)
        } catch (error) {
          console.warn(`Failed to preload audio: ${url}`, error)
        }
      })
    )
  }, [])

  // Play audio with current settings
  const playAudio = useCallback(async (url: string) => {
    const ctx = getAudioContext()

    // Resume context if suspended (required for iOS)
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    // Stop any currently playing audio
    if (currentSource.current) {
      try {
        currentSource.current.stop()
      } catch {
        // Ignore errors from already stopped sources
      }
    }

    // Get or load the audio buffer
    let buffer = audioBufferCache.current.get(url)
    if (!buffer) {
      try {
        const response = await fetch(url)
        const arrayBuffer = await response.arrayBuffer()
        buffer = await ctx.decodeAudioData(arrayBuffer)
        audioBufferCache.current.set(url, buffer)
      } catch (error) {
        console.error('Failed to load audio:', error)
        return
      }
    }

    // Create audio nodes
    const source = ctx.createBufferSource()
    const gainNode = ctx.createGain()

    source.buffer = buffer
    source.playbackRate.value = settings.playbackSpeed * pitchMultipliers[settings.pitch]
    gainNode.gain.value = settings.volume

    // Connect nodes
    source.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Store reference and play
    currentSource.current = source
    source.start(0)

    // Clean up when finished
    source.onended = () => {
      currentSource.current = null
    }
  }, [settings])

  // Stop currently playing audio
  const stopAudio = useCallback(() => {
    if (currentSource.current) {
      try {
        currentSource.current.stop()
      } catch {
        // Ignore
      }
      currentSource.current = null
    }
  }, [])

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initAudio = () => {
      getAudioContext()
      document.removeEventListener('touchstart', initAudio)
      document.removeEventListener('click', initAudio)
    }

    document.addEventListener('touchstart', initAudio, { once: true })
    document.addEventListener('click', initAudio, { once: true })

    return () => {
      document.removeEventListener('touchstart', initAudio)
      document.removeEventListener('click', initAudio)
    }
  }, [])

  return {
    playAudio,
    preloadAudio,
    stopAudio,
  }
}

// Generate placeholder audio URL based on score
export function getAudioUrl(scoreId: string, isRon: boolean, isParent: boolean): string {
  const type = isRon ? 'ron' : 'tsumo'
  const player = isParent ? 'parent' : 'child'
  return `/audio/${player}_${type}_${scoreId}.mp3`
}
