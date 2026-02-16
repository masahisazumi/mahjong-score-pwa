import { useState, useEffect, useRef } from 'react'
import { scoreTable } from '../data/scores'
import { getAudioUrl } from './useAudioPlayer'

const AUDIO_CACHE_NAME = 'audio-cache'
const MAX_HONBA = 10

// Generate all audio URLs from the score table
function generateAllAudioUrls(): string[] {
  const urls: string[] = []
  for (const score of scoreTable) {
    for (const isParent of [true, false]) {
      for (const isRon of [true, false]) {
        for (let honba = 0; honba <= MAX_HONBA; honba++) {
          urls.push(getAudioUrl(score.id, isRon, isParent, honba))
        }
      }
    }
  }
  return urls
}

export interface AudioCacheStatus {
  state: 'checking' | 'downloading' | 'done' | 'error'
  cached: number
  total: number
}

export function useAudioCache(): AudioCacheStatus {
  const [status, setStatus] = useState<AudioCacheStatus>({
    state: 'checking',
    cached: 0,
    total: 0,
  })
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const allUrls = generateAllAudioUrls()
    const total = allUrls.length

    ;(async () => {
      try {
        const cache = await caches.open(AUDIO_CACHE_NAME)

        // Check how many files are already cached
        const existingKeys = await cache.keys()
        const existingUrls = new Set(existingKeys.map(r => new URL(r.url).pathname))
        const uncached = allUrls.filter(url => !existingUrls.has(url))
        const alreadyCached = total - uncached.length

        if (uncached.length === 0) {
          setStatus({ state: 'done', cached: total, total })
          return
        }

        setStatus({ state: 'downloading', cached: alreadyCached, total })

        // Download uncached files in small batches to avoid overwhelming the browser
        const BATCH_SIZE = 10
        let cached = alreadyCached

        for (let i = 0; i < uncached.length; i += BATCH_SIZE) {
          const batch = uncached.slice(i, i + BATCH_SIZE)
          const results = await Promise.allSettled(
            batch.map(async (url) => {
              const res = await fetch(url)
              if (res.ok) {
                await cache.put(url, res)
              }
            })
          )
          cached += results.filter(r => r.status === 'fulfilled').length
          setStatus({ state: 'downloading', cached, total })
        }

        setStatus({ state: 'done', cached, total })
      } catch (err) {
        console.error('Audio cache warmup failed:', err)
        setStatus(prev => ({ ...prev, state: 'error' }))
      }
    })()
  }, [])

  return status
}
