import React from 'react'
import { PlayerType } from '../types'

interface ModeSelectorProps {
  playerType: PlayerType
  honba: number
  showRare: boolean
  onPlayerTypeChange: (type: PlayerType) => void
  onHonbaChange: (honba: number) => void
  onRareToggle: () => void
  onSettingsClick: () => void
  onManualInputClick: () => void
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  playerType,
  honba,
  showRare,
  onPlayerTypeChange,
  onHonbaChange,
  onRareToggle,
  onSettingsClick,
  onManualInputClick,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4 bg-surface-light border-b border-white/10">
      {/* Left Section: Player Type Toggle */}
      <div className="flex items-center gap-6">
        {/* Parent/Child Toggle */}
        <div className="mode-toggle">
          <button
            onClick={() => onPlayerTypeChange('parent')}
            className={`mode-toggle__option px-8 ${
              playerType === 'parent'
                ? 'mode-toggle__option--active bg-parent text-parent-bg'
                : 'mode-toggle__option--inactive'
            }`}
          >
            <span className="text-2xl font-bold">親</span>
          </button>
          <button
            onClick={() => onPlayerTypeChange('child')}
            className={`mode-toggle__option px-8 ${
              playerType === 'child'
                ? 'mode-toggle__option--active bg-child text-white'
                : 'mode-toggle__option--inactive'
            }`}
          >
            <span className="text-2xl font-bold">子</span>
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-white/20" />

        {/* Honba Selector */}
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm mr-2">本場</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4, 5].map((h) => (
              <button
                key={h}
                onClick={() => onHonbaChange(h)}
                className={`honba-btn ${
                  honba === h ? 'honba-btn--active' : 'honba-btn--inactive'
                }`}
              >
                {h}
              </button>
            ))}
            {/* Extended honba (6-10) in dropdown style */}
            <div className="relative group">
              <button
                className={`honba-btn ${
                  honba > 5 ? 'honba-btn--active' : 'honba-btn--inactive'
                } w-16`}
              >
                {honba > 5 ? honba : '6+'}
              </button>
              <div className="absolute top-full left-0 mt-1 hidden group-hover:flex flex-col bg-surface-lighter rounded-lg border border-white/10 overflow-hidden z-50">
                {[6, 7, 8, 9, 10].map((h) => (
                  <button
                    key={h}
                    onClick={() => onHonbaChange(h)}
                    className={`px-4 py-2 text-left hover:bg-white/10 ${
                      honba === h ? 'bg-primary-600 text-white' : 'text-white/70'
                    }`}
                  >
                    {h}本場
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Honba Display */}
      {honba > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-surface rounded-xl">
          <span className="text-amber-400 font-bold text-lg">
            {honba}本場
          </span>
          <span className="text-white/40 text-sm">
            (+{honba * 300}点)
          </span>
        </div>
      )}

      {/* Right Section: Toggles and Actions */}
      <div className="flex items-center gap-4">
        {/* Rare Score Toggle */}
        <button
          onClick={onRareToggle}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${
            showRare
              ? 'bg-score-rare text-white shadow-lg'
              : 'bg-surface text-white/50 border border-white/10'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          <span>レア</span>
        </button>

        {/* Manual Input Button */}
        <button
          onClick={onManualInputClick}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface border border-white/10 text-white/60 hover:text-white hover:bg-surface-lighter transition-all"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <span>手入力</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onSettingsClick}
          className="p-3 rounded-xl bg-surface border border-white/10 text-white/60 hover:text-white hover:bg-surface-lighter transition-all"
          aria-label="設定"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
