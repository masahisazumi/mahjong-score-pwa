import React, { useCallback, useState } from 'react'
import { ScoreEntry, PlayerType } from '../types'
import { formatScore, formatTsumoScore, formatAllTsumo } from '../data/scores'

interface ScoreButtonProps {
  score: ScoreEntry
  playerType: PlayerType
  type: 'ron' | 'tsumo'
  onPress: (score: ScoreEntry, type: 'ron' | 'tsumo') => void
}

export const ScoreButton: React.FC<ScoreButtonProps> = ({
  score,
  playerType,
  type,
  onPress,
}) => {
  const [isPressed, setIsPressed] = useState(false)

  const handlePress = useCallback(() => {
    setIsPressed(true)
    onPress(score, type)
    setTimeout(() => setIsPressed(false), 150)
  }, [score, type, onPress])

  // Calculate display values
  const getDisplayValue = () => {
    if (type === 'ron') {
      const ronScore = playerType === 'parent' ? score.parentRon : score.childRon
      return ronScore ? formatScore(ronScore) : '-'
    } else {
      // Tsumo
      if (playerType === 'parent') {
        return score.parentTsumoAll ? formatAllTsumo(score.parentTsumoAll) : '-'
      } else {
        if (score.childTsumoParent && score.childTsumoChild) {
          return formatTsumoScore(score.childTsumoParent, score.childTsumoChild)
        }
        return '-'
      }
    }
  }

  // Determine button style based on score type
  const getButtonStyle = () => {
    if (score.isRare) return 'score-btn--rare'
    if (type === 'tsumo') return 'score-btn--tsumo'
    if (playerType === 'parent') return 'score-btn--parent'
    return 'score-btn--child'
  }

  // Get background gradient based on han value
  const getHanStyle = () => {
    if (score.isMangan) {
      if (score.han >= 13) return 'from-red-500 to-red-600' // Yakuman
      if (score.han >= 11) return 'from-orange-500 to-orange-600' // Sanbaiman
      if (score.han >= 8) return 'from-amber-500 to-amber-600' // Baiman
      if (score.han >= 6) return 'from-yellow-500 to-yellow-600' // Haneman
      return 'from-green-500 to-green-600' // Mangan
    }
    return ''
  }

  const displayValue = getDisplayValue()
  const buttonStyle = getButtonStyle()
  const hanStyle = getHanStyle()

  return (
    <button
      onTouchStart={handlePress}
      onMouseDown={handlePress}
      className={`
        score-btn ${buttonStyle}
        ${score.isMangan ? `bg-gradient-to-b ${hanStyle}` : ''}
        ${isPressed ? 'scale-95 brightness-90' : ''}
        ${score.isRare ? 'ring-2 ring-pink-400/50' : ''}
      `}
      style={{
        minHeight: score.isMangan ? '90px' : '80px',
      }}
    >
      {/* Score Label (Han/Fu or Name) */}
      <span className="text-xs opacity-70 mb-1">
        {score.labelShort || score.label}
      </span>

      {/* Main Score Value */}
      <span className={`
        font-bold text-shadow
        ${score.isMangan ? 'text-2xl' : 'text-xl'}
      `}>
        {displayValue}
      </span>

      {/* Type indicator */}
      <span className="absolute bottom-1 right-2 text-[10px] opacity-50 uppercase">
        {type === 'ron' ? 'ロン' : 'ツモ'}
      </span>

      {/* Rare indicator */}
      {score.isRare && (
        <span className="absolute top-1 left-1">
          <svg className="w-3 h-3 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </span>
      )}
    </button>
  )
}
