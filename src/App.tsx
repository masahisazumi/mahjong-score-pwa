import React, { useCallback } from 'react'
import { ModeSelector, ScoreGridOptimized, SettingsPanel, ManualInput, GuidePanel } from './components'
import { useAppState } from './hooks/useAppState'
import { useAudioPlayer, getAudioUrl } from './hooks/useAudioPlayer'
import { getBaseScoreById, generateAnnouncementText, generateBaseAnnouncementText } from './data/scores'
import { ScoreEntry } from './types'

const App: React.FC = () => {
  const {
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
    toggleGuide,
    closeGuide,
  } = useAppState()

  const { playAudio } = useAudioPlayer(state.settings)

  // Handle score button press - always use pre-generated MP3 with TTS fallback
  const handleScorePress = useCallback((score: ScoreEntry, type: 'ron' | 'tsumo') => {
    const audioUrl = getAudioUrl(score.id, type === 'ron', state.playerType === 'parent', state.honba)

    // Generate TTS fallback text for offline
    let fallbackText: string
    if (state.honba > 0) {
      const baseScore = getBaseScoreById(score.id)
      fallbackText = baseScore
        ? generateAnnouncementText(baseScore, score, state.playerType, type)
        : ''
    } else {
      fallbackText = generateBaseAnnouncementText(score, state.playerType, type)
    }

    playAudio(audioUrl, fallbackText)

    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }, [state.playerType, state.honba, playAudio])

  // Handle manual input score
  const handleManualScore = useCallback((score: number) => {
    // For manual input, we'd need a generic audio file or TTS
    // For now, just provide feedback
    console.log('Manual score:', score)
    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50])
    }
    closeManualInput()
  }, [closeManualInput])

  return (
    <div className="h-full flex flex-col bg-surface overflow-hidden">
      {/* Header / Mode Selector */}
      <ModeSelector
        playerType={state.playerType}
        honba={state.honba}
        showRare={state.showRare}
        onPlayerTypeChange={setPlayerType}
        onHonbaChange={setHonba}
        onRareToggle={toggleRare}
        onSettingsClick={toggleSettings}
        onManualInputClick={toggleManualInput}
        onGuideClick={toggleGuide}
      />

      {/* Current Mode Indicator */}
      <div className={`
        flex items-center justify-center gap-4 py-2 px-4
        ${state.playerType === 'parent' ? 'bg-parent/10' : 'bg-child/10'}
        border-b border-white/5
      `}>
        <span className={`
          text-sm font-bold
          ${state.playerType === 'parent' ? 'text-parent' : 'text-child'}
        `}>
          {state.playerType === 'parent' ? '親' : '子'}
        </span>
        {state.honba > 0 && (
          <>
            <span className="text-white/20">•</span>
            <span className="text-amber-400 text-sm">
              {state.honba}本場 (+{state.honba * 300})
            </span>
          </>
        )}
        {state.showRare && (
          <>
            <span className="text-white/20">•</span>
            <span className="text-pink-400 text-sm">レア表示中</span>
          </>
        )}
        <span className="ml-auto text-white/20 text-xs">v2.1</span>
      </div>

      {/* Score Grid - Optimized for iPad Landscape */}
      <ScoreGridOptimized
        playerType={state.playerType}
        honba={state.honba}
        showRare={state.showRare}
        onScorePress={handleScorePress}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={state.isSettingsOpen}
        settings={state.settings}
        onClose={closeSettings}
        onVolumeChange={setVolume}
        onSpeedChange={setPlaybackSpeed}
        onPitchChange={setPitch}
      />

      {/* Manual Input Modal */}
      <ManualInput
        isOpen={state.isManualInputOpen}
        onClose={closeManualInput}
        onPlayScore={handleManualScore}
      />

      {/* Guide Panel */}
      <GuidePanel
        isOpen={state.isGuideOpen}
        onClose={closeGuide}
      />

      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  )
}

// Offline status indicator
const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine)

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-amber-600 text-white rounded-full text-sm font-medium shadow-lg z-50">
      オフラインモード
    </div>
  )
}

export default App
