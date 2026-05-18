export type CoachId =
  | 'grandmaster'
  | 'teacher'
  | 'toxic'
  | 'anime'
  | 'military'

export interface Coach {
  id: CoachId
  name: string
  emoji: string
  tagline: string
  color: string
  gradient: string
}

export type HighlightType =
  | 'brilliant'
  | 'blunder'
  | 'turning_point'
  | 'tactical'
  | 'checkmate'
  | 'best_move'

export interface GameHighlight {
  id: string
  type: HighlightType
  moveNumber: number
  san: string
  fen: string
  evalBefore: number
  evalAfter: number
  evalSwing: number
  explanation: string
  emoji: string
  label: string
}

export interface CoachComment {
  id: string
  text: string
  moveNumber: number
  severity: 'info' | 'good' | 'warning' | 'critical' | 'epic'
  timestamp: number
}

export type GameOutcome = 'win' | 'loss' | 'draw'

export interface SavedGame {
  id: string
  pgn: string
  result: string
  outcome: GameOutcome
  playerColor: 'w' | 'b'
  playedAt: string
  highlights: GameHighlight[]
  coachId: CoachId
}

export interface UserStats {
  wins: number
  losses: number
  draws: number
  gamesPlayed: number
  lastPlayedAt?: string
}

export interface FeedItem {
  id: string
  username: string
  avatar: string
  type: HighlightType
  title: string
  san: string
  evalSwing: number
  likes: number
  views: number
  gradient: string
}
