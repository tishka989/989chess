import type { CoachId, GameHighlight } from '../types'
import {
  db,
  getActiveUserId,
  setActiveUserId,
  type CheckPulseExport,
  type DbGame,
  type DbStats,
  type DbUser,
} from './db'

export function outcomeFromResult(
  result: string,
  playerColor: 'w' | 'b'
): 'win' | 'loss' | 'draw' {
  if (result === '1/2-1/2' || result === 'draw') return 'draw'
  if (playerColor === 'w') return result === '1-0' ? 'win' : 'loss'
  return result === '0-1' ? 'win' : 'loss'
}

export async function ensureUserStats(userId: string): Promise<DbStats> {
  let stats = await db.stats.get(userId)
  if (!stats) {
    stats = {
      userId,
      wins: 0,
      losses: 0,
      draws: 0,
      gamesPlayed: 0,
    }
    await db.stats.put(stats)
  }
  return stats
}

export async function upsertUser(user: DbUser): Promise<void> {
  await db.users.put(user)
  await ensureUserStats(user.id)
  setActiveUserId(user.id)
}

export async function getActiveUser(): Promise<DbUser | null> {
  const id = getActiveUserId()
  if (!id) return null
  return (await db.users.get(id)) ?? null
}

export async function getActiveStats(): Promise<DbStats | null> {
  const id = getActiveUserId()
  if (!id) return null
  return (await db.stats.get(id)) ?? null
}

export async function getGamesForUser(userId: string): Promise<DbGame[]> {
  return db.games.where('userId').equals(userId).reverse().sortBy('playedAt')
}

export async function recordGame(
  userId: string,
  data: {
    pgn: string
    result: string
    playerColor: 'w' | 'b'
    playedAt: string
    highlights: GameHighlight[]
    coachId: CoachId
  }
): Promise<DbGame> {
  const outcome = outcomeFromResult(data.result, data.playerColor)
  const game: DbGame = {
    id: crypto.randomUUID(),
    userId,
    ...data,
    outcome,
  }

  await db.games.put(game)

  const stats = await ensureUserStats(userId)
  const updated: DbStats = {
    ...stats,
    gamesPlayed: stats.gamesPlayed + 1,
    wins: stats.wins + (outcome === 'win' ? 1 : 0),
    losses: stats.losses + (outcome === 'loss' ? 1 : 0),
    draws: stats.draws + (outcome === 'draw' ? 1 : 0),
    lastPlayedAt: data.playedAt,
  }
  await db.stats.put(updated)

  return game
}

export async function exportUserData(userId: string): Promise<CheckPulseExport> {
  const user = await db.users.get(userId)
  const stats = await db.stats.get(userId)
  const games = await getGamesForUser(userId)

  if (!user || !stats) {
    throw new Error('No user data to export')
  }

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    user,
    stats,
    games,
  }
}

export function downloadExport(data: CheckPulseExport, filename?: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download =
    filename ??
    `checkpulse-${data.user.username}-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importUserData(
  payload: CheckPulseExport,
  replace = true
): Promise<DbUser> {
  if (payload.version !== 1) {
    throw new Error('Unsupported export version')
  }

  if (replace) {
    const existingGames = await db.games.where('userId').equals(payload.user.id).toArray()
    await db.games.bulkDelete(existingGames.map((g) => g.id))
  }

  await db.users.put(payload.user)
  await db.stats.put(payload.stats)
  await db.games.bulkPut(payload.games)
  setActiveUserId(payload.user.id)

  return payload.user
}

export async function clearUserData(userId: string): Promise<void> {
  const games = await db.games.where('userId').equals(userId).toArray()
  await db.games.bulkDelete(games.map((g) => g.id))
  await db.stats.delete(userId)
  await db.users.delete(userId)
  if (getActiveUserId() === userId) setActiveUserId(null)
}

/** One-time migration from legacy localStorage keys */
export async function migrateLegacyStorage(): Promise<void> {
  const LEGACY_USER = 'checkpulse-user'
  const LEGACY_GAMES = 'checkpulse-games'
  const MIGRATED = 'checkpulse-dexie-migrated'

  if (localStorage.getItem(MIGRATED)) return

  try {
    const rawUser = localStorage.getItem(LEGACY_USER)
    const rawGames = localStorage.getItem(LEGACY_GAMES)
    if (!rawUser) {
      localStorage.setItem(MIGRATED, '1')
      return
    }

    const user = JSON.parse(rawUser) as DbUser
    const existing = await db.users.get(user.id)
    if (!existing) {
      await upsertUser({
        id: user.id,
        email: user.email ?? '',
        username: user.username ?? 'Player',
        avatar: user.avatar ?? '♟',
        coachId: user.coachId ?? 'teacher',
        createdAt: new Date().toISOString(),
      })
    }

    if (rawGames) {
      const games = JSON.parse(rawGames) as Array<{
        id: string
        pgn: string
        result: string
        playedAt: string
        highlights: GameHighlight[]
        coachId: CoachId
      }>

      for (const g of games) {
        const exists = await db.games.get(g.id)
        if (exists) continue
        await recordGame(user.id, {
          pgn: g.pgn,
          result: g.result,
          playerColor: 'w',
          playedAt: g.playedAt,
          highlights: g.highlights,
          coachId: g.coachId,
        })
      }
    }

    localStorage.removeItem(LEGACY_USER)
    localStorage.removeItem(LEGACY_GAMES)
    localStorage.setItem(MIGRATED, '1')
  } catch {
    localStorage.setItem(MIGRATED, '1')
  }
}

export function parseImportFile(file: File): Promise<CheckPulseExport> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as CheckPulseExport
        if (!data.user?.id || !data.stats) {
          reject(new Error('Invalid CheckPulse export file'))
          return
        }
        resolve(data)
      } catch {
        reject(new Error('Could not parse JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
