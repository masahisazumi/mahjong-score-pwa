export type PlayerType = 'parent' | 'child'

export type ScoreType = 'ron' | 'tsumo'

export type PitchLevel = 'low' | 'normal' | 'high'

export interface ScoreEntry {
  id: string
  han: number
  fu: number
  label: string
  labelShort?: string
  parentRon?: number
  parentTsumoAll?: number
  childRon?: number
  childTsumoParent?: number
  childTsumoChild?: number
  isRare?: boolean
  isMangan?: boolean
  audioFile?: string
}

export interface HonbaAdjustedScore {
  base: ScoreEntry
  honba: number
  adjustedLabel: string
  adjustedParentRon?: number
  adjustedParentTsumoAll?: number
  adjustedChildRon?: number
  adjustedChildTsumoParent?: number
  adjustedChildTsumoChild?: number
}

export interface Settings {
  volume: number
  playbackSpeed: number
  pitch: PitchLevel
}

export interface AppState {
  playerType: PlayerType
  honba: number
  showRare: boolean
  settings: Settings
  isSettingsOpen: boolean
  isManualInputOpen: boolean
}
