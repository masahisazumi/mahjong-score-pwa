import React from 'react'
import { Settings } from '../types'

interface SettingsPanelProps {
  isOpen: boolean
  settings: Settings
  onClose: () => void
  onVolumeChange: (volume: number) => void
  onSpeedChange: (speed: number) => void
  onPitchChange: (pitch: number) => void
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  settings,
  onClose,
  onVolumeChange,
  onSpeedChange,
  onPitchChange,
}) => {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-surface-light border-l border-white/10 z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">設定</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="閉じる"
          >
            <svg
              className="w-6 h-6 text-white/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Volume Control */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-lg font-medium text-white">音量</label>
              <span className="text-white/60 text-sm">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-4">
              <svg
                className="w-5 h-5 text-white/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="settings-slider flex-1"
              />
              <svg
                className="w-5 h-5 text-white/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            </div>
          </div>

          {/* Playback Speed Control */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-lg font-medium text-white">再生速度</label>
              <span className="text-white/60 text-sm">
                {settings.playbackSpeed.toFixed(1)}x
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white/40 text-xs">遅い</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.playbackSpeed}
                onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                className="settings-slider flex-1"
              />
              <span className="text-white/40 text-xs">速い</span>
            </div>
            {/* Speed Preset Buttons */}
            <div className="flex gap-2">
              {[0.75, 1.0, 1.25, 1.5].map(speed => (
                <button
                  key={speed}
                  onClick={() => onSpeedChange(speed)}
                  className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${
                    settings.playbackSpeed === speed
                      ? 'bg-primary-600 text-white'
                      : 'bg-surface text-white/60 hover:bg-surface-lighter'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Pitch Control */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-lg font-medium text-white">声の高さ</label>
              <span className="text-white/60 text-sm">
                {settings.pitch.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white/40 text-xs">低い</span>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={settings.pitch}
                onChange={(e) => onPitchChange(parseFloat(e.target.value))}
                className="settings-slider flex-1"
              />
              <span className="text-white/40 text-xs">高い</span>
            </div>
            {/* Pitch Preset Buttons */}
            <div className="flex gap-2">
              {[0.75, 1.0, 1.25, 1.5].map(pitch => (
                <button
                  key={pitch}
                  onClick={() => onPitchChange(pitch)}
                  className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${
                    settings.pitch === pitch
                      ? 'bg-primary-600 text-white'
                      : 'bg-surface text-white/60 hover:bg-surface-lighter'
                  }`}
                >
                  {pitch === 0.75 ? '低' : pitch === 1.0 ? '標準' : pitch === 1.25 ? 'やや高' : '高'}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* App Info */}
          <div className="space-y-3 text-white/40 text-sm">
            <div className="flex justify-between">
              <span>バージョン</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>オフライン対応</span>
              <span className="text-green-400">有効</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-500 transition-colors"
          >
            完了
          </button>
        </div>
      </div>
    </>
  )
}
