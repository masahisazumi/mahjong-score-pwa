import React, { useMemo } from 'react'
import { ScoreButton } from './ScoreButton'
import { ScoreEntry, PlayerType } from '../types'
import { getFilteredScores } from '../data/scores'

interface ScoreGridProps {
  playerType: PlayerType
  honba: number
  showRare: boolean
  onScorePress: (score: ScoreEntry, type: 'ron' | 'tsumo') => void
}

export const ScoreGrid: React.FC<ScoreGridProps> = ({
  playerType,
  honba,
  showRare,
  onScorePress,
}) => {
  const scores = useMemo(
    () => getFilteredScores(playerType, showRare, honba),
    [playerType, showRare, honba]
  )

  // Separate mangan+ scores from regular scores
  const { regularScores, manganScores } = useMemo(() => {
    const regular: ScoreEntry[] = []
    const mangan: ScoreEntry[] = []

    scores.forEach(score => {
      if (score.isMangan && score.fu === 0) {
        mangan.push(score)
      } else {
        regular.push(score)
      }
    })

    return { regularScores: regular, manganScores: mangan }
  }, [scores])

  // Group regular scores by han
  const groupedScores = useMemo(() => {
    const groups: Record<number, ScoreEntry[]> = {}
    regularScores.forEach(score => {
      if (!groups[score.han]) {
        groups[score.han] = []
      }
      groups[score.han].push(score)
    })
    return groups
  }, [regularScores])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {/* Regular Scores by Han */}
      {Object.entries(groupedScores).map(([han, hanScores]) => (
        <div key={han} className="space-y-3">
          {/* Han Header */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-white/80">{han}翻</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Score Grid - Ron and Tsumo side by side */}
          <div className="grid grid-cols-2 gap-4">
            {/* Ron Column */}
            <div className="space-y-2">
              <div className="text-sm text-white/50 px-2">ロン</div>
              <div className="grid grid-cols-3 gap-2">
                {hanScores.map(score => (
                  <ScoreButton
                    key={`ron-${score.id}`}
                    score={score}
                    playerType={playerType}
                    type="ron"
                    onPress={onScorePress}
                  />
                ))}
              </div>
            </div>

            {/* Tsumo Column */}
            <div className="space-y-2">
              <div className="text-sm text-white/50 px-2">ツモ</div>
              <div className="grid grid-cols-3 gap-2">
                {hanScores.map(score => (
                  <ScoreButton
                    key={`tsumo-${score.id}`}
                    score={score}
                    playerType={playerType}
                    type="tsumo"
                    onPress={onScorePress}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Mangan+ Section */}
      {manganScores.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-amber-400">満貫以上</span>
            <div className="flex-1 h-px bg-amber-400/20" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Ron Column */}
            <div className="space-y-2">
              <div className="text-sm text-white/50 px-2">ロン</div>
              <div className="grid grid-cols-3 gap-3">
                {manganScores.map(score => (
                  <ScoreButton
                    key={`ron-${score.id}`}
                    score={score}
                    playerType={playerType}
                    type="ron"
                    onPress={onScorePress}
                  />
                ))}
              </div>
            </div>

            {/* Tsumo Column */}
            <div className="space-y-2">
              <div className="text-sm text-white/50 px-2">ツモ</div>
              <div className="grid grid-cols-3 gap-3">
                {manganScores.map(score => (
                  <ScoreButton
                    key={`tsumo-${score.id}`}
                    score={score}
                    playerType={playerType}
                    type="tsumo"
                    onPress={onScorePress}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom padding for safe area */}
      <div className="h-8" />
    </div>
  )
}
