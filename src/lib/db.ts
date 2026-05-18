import Dexie, { type Table } from 'dexie'
import type { CoachId, GameHighlight } from '../types'

export interface DbUser {
  id: string
  email: string
  username: string
  avatar: string
  coachId: CoachId
  createdAt: string
}

export interface DbStats {
  userId: string
  wins: number
  losses: number
  draws: number
  gamesPlayed: number
  lastPlayedAt?: string
}

export interface DbGame {
  id: string
  userId: string
  pgn: string
  result: string
  outcome: 'win' | 'loss' | 'draw'
  playerColor: 'w' | 'b'
  playedAt: string
  highlights: GameHighlight[]
  coachId: CoachId
}

export interface CheckPulseExport {
  version: 1
  exportedAt: string
  user: DbUser
  stats: DbStats
  games: DbGame[]
}

export class CheckPulseDB extends Dexie {
  users!: Table<DbUser, string>
  stats!: Table<DbStats, string>
  games!: Table<DbGame, string>

  constructor() {
    super('CheckPulseDB')
    this.version(1).stores({
      users: 'id, username, email',
      stats: 'userId',
      games: 'id, userId, playedAt',
    })
  }
}

export const db = new CheckPulseDB()

const SESSION_KEY = 'checkpulse-active-user-id'

export function getActiveUserId(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

export function setActiveUserId(id: string | null) {
  if (id) localStorage.setItem(SESSION_KEY, id)
  else localStorage.removeItem(SESSION_KEY)
}
