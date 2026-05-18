import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
  clearUserData,
  downloadExport,
  exportUserData,
  getActiveStats,
  getActiveUser,
  getGamesForUser,
  importUserData,
  migrateLegacyStorage,
  parseImportFile,
  recordGame,
  upsertUser,
} from '../lib/userData'
import { setActiveUserId } from '../lib/db'
import type { CoachId, SavedGame, UserStats } from '../types'

interface User {
  id: string
  email: string
  username: string
  avatar: string
  coachId: CoachId
}

interface SaveGameInput {
  pgn: string
  result: string
  playerColor: 'w' | 'b'
  playedAt: string
  highlights: SavedGame['highlights']
  coachId: CoachId
}

interface AuthContextValue {
  user: User | null
  stats: UserStats | null
  games: SavedGame[]
  loading: boolean
  signUp: (
    email: string,
    password: string,
    username: string
  ) => Promise<string | null>
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
  saveGame: (game: SaveGameInput) => Promise<void>
  exportData: () => Promise<void>
  importData: (file: File) => Promise<string | null>
  clearData: () => Promise<void>
  refreshData: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function mapGames(rows: Awaited<ReturnType<typeof getGamesForUser>>): SavedGame[] {
  return rows.map((g) => ({
    id: g.id,
    pgn: g.pgn,
    result: g.result,
    outcome: g.outcome,
    playerColor: g.playerColor,
    playedAt: g.playedAt,
    highlights: g.highlights,
    coachId: g.coachId,
  }))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [games, setGames] = useState<SavedGame[]>([])
  const [loading, setLoading] = useState(true)

  const refreshData = useCallback(async () => {
    const dbUser = await getActiveUser()
    if (!dbUser) {
      setUser(null)
      setStats(null)
      setGames([])
      return
    }

    const dbStats = await getActiveStats()
    const dbGames = await getGamesForUser(dbUser.id)

    setUser({
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      avatar: dbUser.avatar,
      coachId: dbUser.coachId,
    })
    setStats(
      dbStats
        ? {
            wins: dbStats.wins,
            losses: dbStats.losses,
            draws: dbStats.draws,
            gamesPlayed: dbStats.gamesPlayed,
            lastPlayedAt: dbStats.lastPlayedAt,
          }
        : { wins: 0, losses: 0, draws: 0, gamesPlayed: 0 }
    )
    setGames(mapGames(dbGames))
  }, [])

  useEffect(() => {
    async function init() {
      await migrateLegacyStorage()

      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession()
        if (data.session?.user) {
          const u = data.session.user
          await upsertUser({
            id: u.id,
            email: u.email ?? '',
            username: u.user_metadata?.username ?? 'Player',
            avatar: u.user_metadata?.avatar ?? '♟',
            coachId: u.user_metadata?.coachId ?? 'teacher',
            createdAt: new Date().toISOString(),
          })
        }
        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            const u = session.user
            await upsertUser({
              id: u.id,
              email: u.email ?? '',
              username: u.user_metadata?.username ?? 'Player',
              avatar: u.user_metadata?.avatar ?? '♟',
              coachId: u.user_metadata?.coachId ?? 'teacher',
              createdAt: new Date().toISOString(),
            })
          } else {
            setActiveUserId(null)
          }
          await refreshData()
        })
      }

      await refreshData()
      setLoading(false)
    }
    init()
  }, [refreshData])

  const signUp = useCallback(
    async (email: string, password: string, username: string) => {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username, avatar: '♟', coachId: 'teacher' } },
        })
        return error?.message ?? null
      }

      const id = crypto.randomUUID()
      await upsertUser({
        id,
        email,
        username,
        avatar: '♟',
        coachId: 'teacher',
        createdAt: new Date().toISOString(),
      })
      await refreshData()
      return null
    },
    [refreshData]
  )

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        return error?.message ?? null
      }

      const id = crypto.randomUUID()
      await upsertUser({
        id,
        email,
        username: email.split('@')[0],
        avatar: '♟',
        coachId: 'teacher',
        createdAt: new Date().toISOString(),
      })
      await refreshData()
      return null
    },
    [refreshData]
  )

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    }
    setActiveUserId(null)
    setUser(null)
    setStats(null)
    setGames([])
  }, [])

  const saveGame = useCallback(
    async (game: SaveGameInput) => {
      let userId = user?.id
      if (!userId) {
        const guestId = crypto.randomUUID()
        await upsertUser({
          id: guestId,
          email: 'guest@local',
          username: 'Guest',
          avatar: '♟',
          coachId: game.coachId,
          createdAt: new Date().toISOString(),
        })
        userId = guestId
      }

      await recordGame(userId, game)

      if (isSupabaseConfigured && supabase && user) {
        await supabase.from('games').insert({
          user_id: userId,
          pgn: game.pgn,
          result: game.result,
          highlights: game.highlights,
          coach_id: game.coachId,
        })
      }

      await refreshData()
    },
    [user, refreshData]
  )

  const exportData = useCallback(async () => {
    if (!user) throw new Error('Sign in to export data')
    const data = await exportUserData(user.id)
    downloadExport(data)
  }, [user])

  const importData = useCallback(
    async (file: File) => {
      try {
        const payload = await parseImportFile(file)
        await importUserData(payload, true)
        await refreshData()
        return null
      } catch (e) {
        return e instanceof Error ? e.message : 'Import failed'
      }
    },
    [refreshData]
  )

  const clearData = useCallback(async () => {
    if (!user) return
    await clearUserData(user.id)
    await refreshData()
  }, [user, refreshData])

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        games,
        loading,
        signUp,
        signIn,
        signOut,
        saveGame,
        exportData,
        importData,
        clearData,
        refreshData,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
