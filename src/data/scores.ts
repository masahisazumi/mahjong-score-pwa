import { ScoreEntry } from '../types'

// Standard Mahjong scoring table
// Parent (Oya/親): Wins 50% more on ron, tsumo is "all" payment
// Child (Ko/子): Standard payments

export const scoreTable: ScoreEntry[] = [
  // ===== 1 Han =====
  { id: '1-30', han: 1, fu: 30, label: '1翻30符',
    parentRon: 1500, parentTsumoAll: 500,
    childRon: 1000, childTsumoParent: 500, childTsumoChild: 300 },
  { id: '1-40', han: 1, fu: 40, label: '1翻40符',
    parentRon: 2000, parentTsumoAll: 700,
    childRon: 1300, childTsumoParent: 700, childTsumoChild: 400 },
  { id: '1-50', han: 1, fu: 50, label: '1翻50符', isRare: true,
    parentRon: 2400, parentTsumoAll: 800,
    childRon: 1600, childTsumoParent: 800, childTsumoChild: 400 },
  { id: '1-60', han: 1, fu: 60, label: '1翻60符', isRare: true,
    parentRon: 2900, parentTsumoAll: 1000,
    childRon: 2000, childTsumoParent: 1000, childTsumoChild: 500 },
  { id: '1-70', han: 1, fu: 70, label: '1翻70符', isRare: true,
    parentRon: 3400, parentTsumoAll: 1200,
    childRon: 2300, childTsumoParent: 1200, childTsumoChild: 600 },

  // ===== 2 Han =====
  { id: '2-25', han: 2, fu: 25, label: '2翻25符',
    parentRon: 2400, parentTsumoAll: 800,
    childRon: 1600, childTsumoParent: 800, childTsumoChild: 400 },
  { id: '2-30', han: 2, fu: 30, label: '2翻30符',
    parentRon: 2900, parentTsumoAll: 1000,
    childRon: 2000, childTsumoParent: 1000, childTsumoChild: 500 },
  { id: '2-40', han: 2, fu: 40, label: '2翻40符',
    parentRon: 3900, parentTsumoAll: 1300,
    childRon: 2600, childTsumoParent: 1300, childTsumoChild: 700 },
  { id: '2-50', han: 2, fu: 50, label: '2翻50符',
    parentRon: 4800, parentTsumoAll: 1600,
    childRon: 3200, childTsumoParent: 1600, childTsumoChild: 800 },
  { id: '2-60', han: 2, fu: 60, label: '2翻60符', isRare: true,
    parentRon: 5800, parentTsumoAll: 2000,
    childRon: 3900, childTsumoParent: 2000, childTsumoChild: 1000 },
  { id: '2-70', han: 2, fu: 70, label: '2翻70符', isRare: true,
    parentRon: 6800, parentTsumoAll: 2300,
    childRon: 4500, childTsumoParent: 2300, childTsumoChild: 1200 },

  // ===== 3 Han =====
  { id: '3-25', han: 3, fu: 25, label: '3翻25符',
    parentRon: 4800, parentTsumoAll: 1600,
    childRon: 3200, childTsumoParent: 1600, childTsumoChild: 800 },
  { id: '3-30', han: 3, fu: 30, label: '3翻30符',
    parentRon: 5800, parentTsumoAll: 2000,
    childRon: 3900, childTsumoParent: 2000, childTsumoChild: 1000 },
  { id: '3-40', han: 3, fu: 40, label: '3翻40符',
    parentRon: 7700, parentTsumoAll: 2600,
    childRon: 5200, childTsumoParent: 2600, childTsumoChild: 1300 },
  { id: '3-50', han: 3, fu: 50, label: '3翻50符', isRare: true,
    parentRon: 9600, parentTsumoAll: 3200,
    childRon: 6400, childTsumoParent: 3200, childTsumoChild: 1600 },
  { id: '3-60', han: 3, fu: 60, label: '3翻60符', isMangan: true,
    parentRon: 12000, parentTsumoAll: 4000,
    childRon: 8000, childTsumoParent: 4000, childTsumoChild: 2000 },

  // ===== 4 Han =====
  { id: '4-25', han: 4, fu: 25, label: '4翻25符',
    parentRon: 9600, parentTsumoAll: 3200,
    childRon: 6400, childTsumoParent: 3200, childTsumoChild: 1600 },
  { id: '4-30', han: 4, fu: 30, label: '4翻30符', isMangan: true,
    parentRon: 12000, parentTsumoAll: 4000,
    childRon: 8000, childTsumoParent: 4000, childTsumoChild: 2000 },
  { id: '4-40', han: 4, fu: 40, label: '4翻40符', isMangan: true,
    parentRon: 12000, parentTsumoAll: 4000,
    childRon: 8000, childTsumoParent: 4000, childTsumoChild: 2000 },

  // ===== Mangan (満貫) =====
  { id: 'mangan', han: 5, fu: 0, label: '満貫', labelShort: '満貫', isMangan: true,
    parentRon: 12000, parentTsumoAll: 4000,
    childRon: 8000, childTsumoParent: 4000, childTsumoChild: 2000 },

  // ===== Haneman (跳満) =====
  { id: 'haneman', han: 6, fu: 0, label: '跳満', labelShort: '跳満', isMangan: true,
    parentRon: 18000, parentTsumoAll: 6000,
    childRon: 12000, childTsumoParent: 6000, childTsumoChild: 3000 },

  // ===== Baiman (倍満) =====
  { id: 'baiman', han: 8, fu: 0, label: '倍満', labelShort: '倍満', isMangan: true,
    parentRon: 24000, parentTsumoAll: 8000,
    childRon: 16000, childTsumoParent: 8000, childTsumoChild: 4000 },

  // ===== Sanbaiman (三倍満) =====
  { id: 'sanbaiman', han: 11, fu: 0, label: '三倍満', labelShort: '三倍満', isMangan: true,
    parentRon: 36000, parentTsumoAll: 12000,
    childRon: 24000, childTsumoParent: 12000, childTsumoChild: 6000 },

  // ===== Yakuman (役満) =====
  { id: 'yakuman', han: 13, fu: 0, label: '役満', labelShort: '役満', isMangan: true,
    parentRon: 48000, parentTsumoAll: 16000,
    childRon: 32000, childTsumoParent: 16000, childTsumoChild: 8000 },

  // ===== Double Yakuman =====
  { id: 'double-yakuman', han: 26, fu: 0, label: 'ダブル役満', labelShort: 'W役満', isMangan: true, isRare: true,
    parentRon: 96000, parentTsumoAll: 32000,
    childRon: 64000, childTsumoParent: 32000, childTsumoChild: 16000 },
]

// Honba adjustment: +300 per honba for ron, +100 per honba per player for tsumo
export function adjustScoreForHonba(score: ScoreEntry, honba: number): ScoreEntry {
  if (honba === 0) return score

  const honbaRonBonus = honba * 300
  const honbaTsumoBonus = honba * 100

  return {
    ...score,
    parentRon: score.parentRon ? score.parentRon + honbaRonBonus : undefined,
    parentTsumoAll: score.parentTsumoAll ? score.parentTsumoAll + honbaTsumoBonus : undefined,
    childRon: score.childRon ? score.childRon + honbaRonBonus : undefined,
    childTsumoParent: score.childTsumoParent ? score.childTsumoParent + honbaTsumoBonus : undefined,
    childTsumoChild: score.childTsumoChild ? score.childTsumoChild + honbaTsumoBonus : undefined,
  }
}

// Get filtered scores based on player type and rare toggle
export function getFilteredScores(
  _playerType: 'parent' | 'child',
  showRare: boolean,
  honba: number
): ScoreEntry[] {
  // Note: playerType param reserved for future filtering logic
  return scoreTable
    .filter(score => showRare || !score.isRare)
    .map(score => adjustScoreForHonba(score, honba))
}

// Get base score by ID (before honba adjustment)
export function getBaseScoreById(id: string): ScoreEntry | undefined {
  return scoreTable.find(s => s.id === id)
}

// Format score for display
export function formatScore(score: number): string {
  return score.toLocaleString('ja-JP')
}

// Format tsumo score (parent pays X, child pays Y)
export function formatTsumoScore(parentPay: number, childPay: number): string {
  return `${formatScore(childPay)}/${formatScore(parentPay)}`
}

// Format all-pay tsumo (everyone pays X)
export function formatAllTsumo(amount: number): string {
  return `${formatScore(amount)}オール`
}

// Convert number to Japanese katakana reading for TTS
export function numberToJapanese(num: number): string {
  if (num === 0) return 'ゼロ'

  let result = ''
  let remaining = num

  // 万 (10000s)
  const man = Math.floor(remaining / 10000)
  if (man > 0) {
    const manPrefixes: Record<number, string> = {
      1: 'イチ', 2: 'ニ', 3: 'サン', 4: 'ヨン', 5: 'ゴ',
      6: 'ロク', 7: 'ナナ', 8: 'ハチ', 9: 'キュウ',
    }
    result += manPrefixes[man] + 'マン'
    remaining %= 10000
  }

  // 千 (1000s)
  const sen = Math.floor(remaining / 1000)
  if (sen > 0) {
    const senReadings: Record<number, string> = {
      1: 'セン', 2: 'ニセン', 3: 'サンゼン', 4: 'ヨンセン', 5: 'ゴセン',
      6: 'ロクセン', 7: 'ナナセン', 8: 'ハッセン', 9: 'キュウセン',
    }
    result += senReadings[sen]
    remaining %= 1000
  }

  // 百 (100s)
  const hyaku = Math.floor(remaining / 100)
  if (hyaku > 0) {
    const hyakuReadings: Record<number, string> = {
      1: 'ヒャク', 2: 'ニヒャク', 3: 'サンビャク', 4: 'ヨンヒャク', 5: 'ゴヒャク',
      6: 'ロッピャク', 7: 'ナナヒャク', 8: 'ハッピャク', 9: 'キュウヒャク',
    }
    result += hyakuReadings[hyaku]
  }

  return result
}

// Generate announcement text for TTS when honba > 0
// Format: "base わ、adjusted" (は is written as わ to ensure "wa" pronunciation)
export function generateAnnouncementText(
  baseScore: ScoreEntry,
  adjustedScore: ScoreEntry,
  playerType: 'parent' | 'child',
  type: 'ron' | 'tsumo'
): string {
  if (type === 'ron') {
    const base = playerType === 'parent' ? baseScore.parentRon : baseScore.childRon
    const adjusted = playerType === 'parent' ? adjustedScore.parentRon : adjustedScore.childRon
    if (!base || !adjusted) return ''
    return `${numberToJapanese(base)}わ、${numberToJapanese(adjusted)}`
  } else {
    if (playerType === 'parent') {
      const base = baseScore.parentTsumoAll
      const adjusted = adjustedScore.parentTsumoAll
      if (!base || !adjusted) return ''
      return `${numberToJapanese(base)}わ、${numberToJapanese(adjusted)}オール`
    } else {
      const baseChild = baseScore.childTsumoChild
      const baseParent = baseScore.childTsumoParent
      const adjChild = adjustedScore.childTsumoChild
      const adjParent = adjustedScore.childTsumoParent
      if (!baseChild || !baseParent || !adjChild || !adjParent) return ''
      return `${numberToJapanese(baseChild)}、${numberToJapanese(baseParent)}わ、${numberToJapanese(adjChild)}、${numberToJapanese(adjParent)}`
    }
  }
}
