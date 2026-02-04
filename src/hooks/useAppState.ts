import { useState, useEffect, useCallback } from 'react'
import { AppState, PlayerType, PitchLevel, Settings } from '../types'

const STORAGE_KEY = 'mahjong-score-settings'

const defaultSettings: Settings = {
  volume: 1.0,
  playbackSpeed: 1.0,
  pitch: 'normal',
}

const defaultState: AppState = {
  playerType: 'child',
  honba: 0,
  showRare: false,
  settings: defaultSettings,
  isSettingsOpen: false,
  isManualInputOpen: false,
}

function loadSettings(): Settings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) }
    }
  } catch {
    console.warn('Failed to load settings from localStorage')
  }
  return defaultSettings
}

function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    console.warn('Failed to save settings to localStorage')
  }
}

export function useAppState() {
  const [state, setState] = useState<AppState>(() => ({
    ...defaultState,
    settings: loadSettings(),
  }))

  // Save settings whenever they change
  useEffect(() => {
    saveSettings(state.settings)
  }, [state.settings])

  const setPlayerType = useCallback((playerType: PlayerType) => {
    setState(prev => ({ ...prev, playerType }))
  }, [])

  const setHonba = useCallback((honba: number) => {
    setState(prev => ({ ...prev, honba: Math.max(0, Math.min(10, honba)) }))
  }, [])

  const toggleRare = useCallback(() => {
    setState(prev => ({ ...prev, showRare: !prev.showRare }))
  }, [])

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, volume: Math.max(0, Math.min(1, volume)) }
    }))
  }, [])

  const setPlaybackSpeed = useCallback((playbackSpeed: number) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, playbackSpeed: Math.max(0.5, Math.min(2, playbackSpeed)) }
    }))
  }, [])

  const setPitch = useCallback((pitch: PitchLevel) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, pitch }
    }))
  }, [])

  const toggleSettings = useCallback(() => {
    setState(prev => ({ ...prev, isSettingsOpen: !prev.isSettingsOpen }))
  }, [])

  const closeSettings = useCallback(() => {
    setState(prev => ({ ...prev, isSettingsOpen: false }))
  }, [])

  const toggleManualInput = useCallback(() => {
    setState(prev => ({ ...prev, isManualInputOpen: !prev.isManualInputOpen }))
  }, [])

  const closeManualInput = useCallback(() => {
    setState(prev => ({ ...prev, isManualInputOpen: false }))
  }, [])

  return {
    state,
    setPlayerType,
    setHonba,
    toggleRare,
    setVolume,
    setPlaybackSpeed,
    setPitch,
    toggleSettings,
    closeSettings,
    toggleManualInput,
    closeManualInput,
  }
}
