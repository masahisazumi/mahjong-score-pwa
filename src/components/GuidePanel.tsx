import React from 'react'

interface GuidePanelProps {
  isOpen: boolean
  onClose: () => void
}

export const GuidePanel: React.FC<GuidePanelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[480px] max-w-full bg-surface-light border-l border-white/10 z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">使い方ガイド</h2>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Section: Initial Setup */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-amber-400">
              初回セットアップ（Wi-Fi接続時）
            </h3>
            <div className="space-y-3">
              <Step number={1} title="Safariでアプリを開く">
                SafariでこのアプリのURLにアクセスします。
              </Step>
              <Step number={2} title="ホーム画面に追加">
                Safari下部の共有ボタン
                <InlineIcon type="share" />
                をタップし、「ホーム画面に追加」を選択します。
              </Step>
              <Step number={3} title="アプリを開いてキャッシュ">
                ホーム画面に追加されたアイコンからアプリを開きます。
                <span className="text-amber-400 font-medium">
                  全音声ファイル（約27MB）が自動でダウンロードされます。
                </span>
                初回は1分程度お待ちください。
              </Step>
              <Step number={4} title="動作確認">
                ボタンを押して音声が再生されることを確認します。
                設定画面で音量・速度・声の高さを調整できます。
              </Step>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Section: During Game */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-green-400">
              対局中の使い方
            </h3>
            <div className="space-y-3">
              <Step number={1} title="オフラインでOK">
                Wi-Fiオフ・機内モードでも使えます。
              </Step>
              <Step number={2} title="親/子を選択">
                上部の「親」「子」ボタンで和了者を選びます。
              </Step>
              <Step number={3} title="本場を設定">
                0〜10本場まで選択できます。
                本場に応じた加算点も自動で読み上げます。
              </Step>
              <Step number={4} title="点数ボタンを押す">
                該当する翻・符のボタンを押すと音声が再生されます。
              </Step>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Section: Tips */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-blue-400">
              ご注意
            </h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li className="flex gap-2">
                <span className="text-blue-400 shrink-0">*</span>
                <span>
                  <strong className="text-white/90">iPad本体の音量</strong>を十分に上げてください。サイレントモードが解除されていることも確認してください。
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 shrink-0">*</span>
                <span>
                  <strong className="text-white/90">初回キャッシュ前にオフラインにしないでください。</strong>音声ファイルがダウンロードされず、再生できません。
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 shrink-0">*</span>
                <span>
                  キャッシュ完了後は、電波のない場所でもすべての音声が再生されます。
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 shrink-0">*</span>
                <span>
                  「レア」ボタンで通常使わない符（3翻50符など）を表示できます。
                </span>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-500 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </>
  )
}

// Step component
const Step: React.FC<{
  number: number
  title: string
  children: React.ReactNode
}> = ({ number, title, children }) => (
  <div className="flex gap-3">
    <div className="shrink-0 w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
      {number}
    </div>
    <div className="space-y-1">
      <div className="text-white font-medium">{title}</div>
      <div className="text-white/60 text-sm leading-relaxed">{children}</div>
    </div>
  </div>
)

// Inline share icon
const InlineIcon: React.FC<{ type: 'share' }> = ({ type }) => {
  if (type === 'share') {
    return (
      <svg
        className="inline w-4 h-4 mx-1 text-white/60 align-text-bottom"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
        />
      </svg>
    )
  }
  return null
}
