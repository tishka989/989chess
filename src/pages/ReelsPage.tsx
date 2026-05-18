import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Sparkles } from 'lucide-react'
import { ReelsViewer } from '../components/reels/ReelsViewer'
import { GameReelPicker } from '../components/reels/GameReelPicker'
import { useAuth } from '../context/AuthContext'
import { getCoach } from '../data/coaches'

export function ReelsPage() {
  const { games, loading } = useAuth()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const reelGames = useMemo(
    () => games.filter((g) => g.highlights.length > 0),
    [games]
  )

  const selectedGame = useMemo(
    () => reelGames.find((g) => g.id === selectedId) ?? reelGames[0] ?? null,
    [reelGames, selectedId]
  )

  useEffect(() => {
    if (reelGames.length === 0) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !reelGames.some((g) => g.id === selectedId)) {
      setSelectedId(reelGames[0].id)
    }
  }, [reelGames, selectedId])

  const gameLabel = selectedGame
    ? `${selectedGame.outcome} • ${selectedGame.result} • vs AI (${getCoach(selectedGame.coachId).name})`
    : undefined

  if (loading) {
    return (
      <div className="flex min-h-[40dvh] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="h-10 w-10 rounded-full border-2 border-pulse-400 border-t-transparent"
        />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5 pb-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">
            Chess <span className="gradient-text">Reels</span>
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            TikTok-style highlights from your matches
          </p>
        </div>
        <Link
          to="/play"
          className="glass flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold"
        >
          <Play className="h-4 w-4 fill-pulse-400 text-pulse-400" />
          Play
        </Link>
      </div>

      {reelGames.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 text-center"
        >
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-6xl"
          >
            🎬
          </motion.span>
          <h2 className="mt-4 font-display text-xl font-bold">No reels yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
            Finish a game on the Play page. We&apos;ll auto-build vertical highlight
            clips — brilliancies, blunders, turning points, and more.
          </p>
          <Link
            to="/play"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pulse-500 to-neon-pink px-6 py-3 font-semibold text-white shadow-lg shadow-pulse-500/30"
          >
            <Sparkles className="h-5 w-5" />
            Play your first match
          </Link>
        </motion.div>
      ) : (
        <>
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Your matches ({reelGames.length})
            </p>
            <GameReelPicker
              games={reelGames}
              selectedId={selectedGame?.id ?? null}
              onSelect={setSelectedId}
            />
          </section>

          {selectedGame && (
            <ReelsViewer
              key={selectedGame.id}
              highlights={selectedGame.highlights}
              title="Match highlights"
              gameLabel={gameLabel}
            />
          )}
        </>
      )}
    </motion.div>
  )
}
