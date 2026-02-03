import React, { useState, useCallback } from 'react'

interface ManualInputProps {
  isOpen: boolean
  onClose: () => void
  onPlayScore: (score: number) => void
}

export const ManualInput: React.FC<ManualInputProps> = ({
  isOpen,
  onClose,
  onPlayScore,
}) => {
  const [inputValue, setInputValue] = useState('')
  const [honba, setHonba] = useState(0)
  const [memo, setMemo] = useState('')

  const handleNumberPress = useCallback((num: string) => {
    if (inputValue.length < 6) {
      setInputValue(prev => prev + num)
    }
  }, [inputValue])

  const handleClear = useCallback(() => {
    setInputValue('')
  }, [])

  const handleBackspace = useCallback(() => {
    setInputValue(prev => prev.slice(0, -1))
  }, [])

  const handleSubmit = useCallback(() => {
    const score = parseInt(inputValue, 10)
    if (score > 0) {
      const adjustedScore = score + (honba * 300)
      onPlayScore(adjustedScore)
    }
  }, [inputValue, honba, onPlayScore])

  const formatDisplayValue = () => {
    if (!inputValue) return '0'
    const base = parseInt(inputValue, 10)
    const adjusted = base + (honba * 300)
    if (honba > 0) {
      return `${base.toLocaleString()} + ${honba * 300} = ${adjusted.toLocaleString()}`
    }
    return base.toLocaleString()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-8">
        <div className="bg-surface-light rounded-3xl w-full max-w-lg overflow-hidden border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">手動入力</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
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

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Score Display */}
            <div className="bg-surface rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold text-white font-display">
                {formatDisplayValue()}
              </div>
              <div className="text-white/40 text-sm mt-2">点</div>
            </div>

            {/* Honba Selector for Manual Input */}
            <div className="flex items-center justify-between">
              <span className="text-white/60">本場</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => (
                  <button
                    key={h}
                    onClick={() => setHonba(h)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                      honba === h
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface text-white/40 hover:bg-surface-lighter'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  onClick={() => handleNumberPress(num)}
                  className="h-16 rounded-xl bg-surface text-white text-2xl font-bold hover:bg-surface-lighter active:scale-95 transition-all"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="h-16 rounded-xl bg-red-600/20 text-red-400 text-lg font-bold hover:bg-red-600/30 active:scale-95 transition-all"
              >
                C
              </button>
              <button
                onClick={() => handleNumberPress('0')}
                className="h-16 rounded-xl bg-surface text-white text-2xl font-bold hover:bg-surface-lighter active:scale-95 transition-all"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-16 rounded-xl bg-surface text-white/60 hover:bg-surface-lighter active:scale-95 transition-all flex items-center justify-center"
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
                    d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414a2 2 0 011.414-.586H19a2 2 0 012 2v10a2 2 0 01-2 2h-8.172a2 2 0 01-1.414-.586L3 12z"
                  />
                </svg>
              </button>
            </div>

            {/* Quick Values */}
            <div className="flex gap-2">
              {['1000', '2000', '3900', '8000', '12000'].map(value => (
                <button
                  key={value}
                  onClick={() => setInputValue(value)}
                  className="flex-1 py-2 rounded-lg bg-surface text-white/60 text-sm font-medium hover:bg-surface-lighter transition-all"
                >
                  {parseInt(value).toLocaleString()}
                </button>
              ))}
            </div>

            {/* Memo Field */}
            <div className="space-y-2">
              <label className="text-white/60 text-sm">メモ（任意）</label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="役名など..."
                className="w-full px-4 py-3 rounded-xl bg-surface border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-white/10">
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-xl bg-surface text-white/60 font-bold hover:bg-surface-lighter transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              disabled={!inputValue}
              className={`flex-1 py-4 rounded-xl font-bold transition-all ${
                inputValue
                  ? 'bg-primary-600 text-white hover:bg-primary-500'
                  : 'bg-surface text-white/20 cursor-not-allowed'
              }`}
            >
              申告
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
