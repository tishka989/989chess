import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { LogOut, Target, Trophy, XCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { CoachSelector } from '../components/coach/CoachSelector'
import { DataManager } from '../components/profile/DataManager'
import { useCoach } from '../context/CoachContext'

export function ProfilePage() {
  const { user, stats, games, signOut } = useAuth()
  const { coach } = useCoach()

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-4 py-20 text-center"
      >
        <span className="text-5xl">♟</span>
        <p className="font-semibold">Sign in to save your journey</p>
        <p className="max-w-xs text-sm text-[var(--text-secondary)]">
          Or play as guest — stats save locally in IndexedDB automatically.
        </p>
        <Link
          to="/auth"
          className="rounded-2xl bg-gradient-to-r from-pulse-500 to-neon-pink px-6 py-3 font-semibold text-white"
        >
          Sign In
        </Link>
      </motion.div>
    )
  }

  const s = stats ?? { wins: 0, losses: 0, draws: 0, gamesPlayed: 0 }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-8"
    >
      <div className="glass flex items-center gap-4 rounded-2xl p-5">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pulse-500 to-neon-pink text-3xl">
          {user.avatar}
        </span>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold">{user.username}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
          <p className="mt-1 text-xs">
            Coach: {coach.emoji} {coach.name}
          </p>
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="glass flex h-10 w-10 items-center justify-center rounded-xl text-red-400"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Wins', value: s.wins, icon: Trophy, color: 'text-emerald-400' },
          { label: 'Losses', value: s.losses, icon: XCircle, color: 'text-red-400' },
          { label: 'Draws', value: s.draws, icon: Target, color: 'text-amber-400' },
          {
            label: 'Played',
            value: s.gamesPlayed,
            icon: Trophy,
            color: 'text-pulse-400',
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-2xl p-4 text-center">
            <Icon className={`mx-auto h-5 w-5 ${color}`} />
            <p className="mt-1 font-display text-2xl font-bold">{value}</p>
            <p className="text-xs text-[var(--text-secondary)]">{label}</p>
          </div>
        ))}
      </div>

      {s.gamesPlayed > 0 && (
        <div className="glass rounded-2xl px-4 py-3 text-center text-sm">
          Win rate:{' '}
          <span className="font-bold text-emerald-400">
            {Math.round((s.wins / s.gamesPlayed) * 100)}%
          </span>
        </div>
      )}

      <DataManager />

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Your Coach</h2>
        <CoachSelector />
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Match History</h2>
        {games.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center text-sm text-[var(--text-secondary)]">
            No games yet.{' '}
            <Link to="/play" className="text-pulse-400">
              Play your first match →
            </Link>
          </div>
        ) : (
          <motion.div className="space-y-2">
            {games.slice(0, 10).map((g) => (
              <div
                key={g.id}
                className="glass flex items-center justify-between rounded-xl p-4"
              >
                <div>
                  <p className="font-semibold capitalize">
                    {g.outcome}{' '}
                    <span className="text-[var(--text-secondary)]">
                      ({g.result})
                    </span>
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {new Date(g.playedAt).toLocaleDateString()} •{' '}
                    {g.highlights.length} highlights • played{' '}
                    {g.playerColor === 'w' ? 'white' : 'black'}
                  </p>
                </div>
                <span className="text-2xl">
                  {g.outcome === 'win'
                    ? '🏆'
                    : g.outcome === 'loss'
                      ? '💀'
                      : '🤝'}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </section>
    </motion.div>
  )
}
