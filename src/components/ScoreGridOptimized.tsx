import React, { useMemo } from 'react'
import { ScoreEntry, PlayerType } from '../types'
import { getFilteredScores, formatScore, formatTsumoScore, formatAllTsumo } from '../data/scores'

interface ScoreGridOptimizedProps {
  playerType: PlayerType
  honba: number
  showRare: boolean
  onScorePress: (score: ScoreEntry, type: 'ron' | 'tsumo') => void
}

// Optimized Score Button for better performance
const OptimizedScoreButton: React.FC<{
  score: ScoreEntry
  playerType: PlayerType
  type: 'ron' | 'tsumo'
  onPress: () => void
}> = React.memo(({ score, playerType, type, onPress }) => {
  // Calculate display value
  const displayValue = useMemo(() => {
    if (type === 'ron') {
      const ronScore = playerType === 'parent' ? score.parentRon : score.childRon
      return ronScore ? formatScore(ronScore) : '-'
    } else {
      if (playerType === 'parent') {
        return score.parentTsumoAll ? formatAllTsumo(score.parentTsumoAll) : '-'
      } else {
        if (score.childTsumoParent && score.childTsumoChild) {
          return formatTsumoScore(score.childTsumoParent, score.childTsumoChild)
        }
        return '-'
      }
    }
  }, [score, playerType, type])

  // Style classes based on score type
  const buttonClass = useMemo(() => {
    let base = 'relative flex flex-col items-center justify-center rounded-xl font-display font-bold transition-all duration-75 select-none cursor-pointer border-2 active:scale-95 active:brightness-90 min-h-[70px]'

    if (score.isMangan) {
      if (score.han >= 13) base += ' bg-gradient-to-b from-red-500 to-red-600 border-red-400/30 text-white'
      else if (score.han >= 11) base += ' bg-gradient-to-b from-orange-500 to-orange-600 border-orange-400/30 text-white'
      else if (score.han >= 8) base += ' bg-gradient-to-b from-amber-500 to-amber-600 border-amber-400/30 text-amber-950'
      else if (score.han >= 6) base += ' bg-gradient-to-b from-yellow-400 to-yellow-500 border-yellow-300/30 text-yellow-950'
      else base += ' bg-gradient-to-b from-emerald-500 to-emerald-600 border-emerald-400/30 text-white'
    } else if (score.isRare) {
      base += ' bg-gradient-to-b from-pink-500 to-pink-600 border-pink-400/30 text-white ring-1 ring-pink-400/50'
    } else if (type === 'tsumo') {
      base += ' bg-gradient-to-b from-violet-500 to-violet-600 border-violet-400/30 text-white'
    } else if (playerType === 'parent') {
      base += ' bg-gradient-to-b from-amber-500 to-amber-600 border-amber-400/30 text-amber-950'
    } else {
      base += ' bg-gradient-to-b from-blue-500 to-blue-600 border-blue-400/30 text-white'
    }

    return base
  }, [score, playerType, type])

  return (
    <button
      onTouchStart={(e) => {
        e.preventDefault()
        onPress()
      }}
      onMouseDown={(e) => {
        e.preventDefault()
        onPress()
      }}
      className={buttonClass}
    >
      {/* Label */}
      <span className="text-[10px] opacity-70 leading-tight">
        {score.labelShort || score.label}
      </span>

      {/* Main Score */}
      <span className="text-lg font-bold leading-tight text-shadow">
        {displayValue}
      </span>

      {/* Type indicator */}
      <span className="absolute bottom-0.5 right-1.5 text-[8px] opacity-40">
        {type === 'ron' ? 'ロン' : 'ツモ'}
      </span>
    </button>
  )
})

OptimizedScoreButton.displayName = 'OptimizedScoreButton'

export const ScoreGridOptimized: React.FC<ScoreGridOptimizedProps> = ({
  playerType,
  honba,
  showRare,
  onScorePress,
}) => {
  const scores = useMemo(
    () => getFilteredScores(playerType, showRare, honba),
    [playerType, showRare, honba]
  )

  // Organize scores into sections
  const { ronScores, tsumoScores, manganRon, manganTsumo } = useMemo(() => {
    const ron: ScoreEntry[] = []
    const tsumo: ScoreEntry[] = []
    const mRon: ScoreEntry[] = []
    const mTsumo: ScoreEntry[] = []

    scores.forEach(score => {
      if (score.isMangan && score.fu === 0) {
        mRon.push(score)
        mTsumo.push(score)
      } else {
        ron.push(score)
        tsumo.push(score)
      }
    })

    return { ronScores: ron, tsumoScores: tsumo, manganRon: mRon, manganTsumo: mTsumo }
  }, [scores])

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Panel - Ron Scores */}
      <div className="flex-1 flex flex-col border-r border-white/10">
        {/* Ron Header */}
        <div className={`
          px-4 py-3 text-center font-bold text-lg border-b border-white/10
          ${playerType === 'parent' ? 'bg-parent/20 text-parent' : 'bg-child/20 text-child'}
        `}>
          ロン
        </div>

        {/* Ron Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Regular Ron Scores by Han */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {ronScores.map(score => (
              <OptimizedScoreButton
                key={`ron-${score.id}`}
                score={score}
                playerType={playerType}
                type="ron"
                onPress={() => onScorePress(score, 'ron')}
              />
            ))}
          </div>

          {/* Mangan+ Section */}
          {manganRon.length > 0 && (
            <>
              <div className="flex items-center gap-2 my-3">
                <div className="h-px flex-1 bg-amber-500/30" />
                <span className="text-amber-400 text-xs font-bold">満貫以上</span>
                <div className="h-px flex-1 bg-amber-500/30" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {manganRon.map(score => (
                  <OptimizedScoreButton
                    key={`ron-${score.id}`}
                    score={score}
                    playerType={playerType}
                    type="ron"
                    onPress={() => onScorePress(score, 'ron')}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Tsumo Scores */}
      <div className="flex-1 flex flex-col">
        {/* Tsumo Header */}
        <div className="px-4 py-3 text-center font-bold text-lg border-b border-white/10 bg-violet-500/20 text-violet-300">
          ツモ
        </div>

        {/* Tsumo Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Regular Tsumo Scores */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {tsumoScores.map(score => (
              <OptimizedScoreButton
                key={`tsumo-${score.id}`}
                score={score}
                playerType={playerType}
                type="tsumo"
                onPress={() => onScorePress(score, 'tsumo')}
              />
            ))}
          </div>

          {/* Mangan+ Section */}
          {manganTsumo.length > 0 && (
            <>
              <div className="flex items-center gap-2 my-3">
                <div className="h-px flex-1 bg-amber-500/30" />
                <span className="text-amber-400 text-xs font-bold">満貫以上</span>
                <div className="h-px flex-1 bg-amber-500/30" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {manganTsumo.map(score => (
                  <OptimizedScoreButton
                    key={`tsumo-${score.id}`}
                    score={score}
                    playerType={playerType}
                    type="tsumo"
                    onPress={() => onScorePress(score, 'tsumo')}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
