import { motion } from 'framer-motion'
import clsx from 'clsx'
import type { SavedGame } from '../../types'

interface GameReelPickerProps {
  games: SavedGame[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function GameReelPicker({
  games,
  selectedId,
  onSelect,
}: GameReelPickerProps) {
  if (games.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {games.map((g) => {
        const active = g.id === selectedId
        const emoji =
          g.outcome === 'win' ? '🏆' : g.outcome === 'loss' ? '💀' : '🤝'
        return (
          <button
            key={g.id}
            type="button"
            onClick={() => onSelect(g.id)}
            className={clsx(
              'shrink-0 rounded-2xl border px-4 py-2.5 text-left transition-all',
              active
                ? 'border-pulse-400 bg-pulse-500/20 shadow-lg shadow-pulse-500/20'
                : 'border-[var(--bg-glass-border)] bg-[var(--bg-glass)] hover:border-white/20'
            )}
          >
            <span className="text-lg">{emoji}</span>
            <p className="mt-0.5 text-xs font-semibold capitalize">{g.outcome}</p>
            <p className="text-[10px] text-[var(--text-secondary)]">
              {new Date(g.playedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}{' '}
              • {g.highlights.length} clips
            </p>
          </button>
        )
      })}
    </motion.div>
  )
}
