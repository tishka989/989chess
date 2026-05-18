import { motion } from 'framer-motion'
import { Eye, Flame, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { FeedItem } from '../../types'

const TYPE_LABELS: Record<string, string> = {
  brilliant: '🔥 Brilliant',
  blunder: '💀 Blunder',
  turning_point: '⚡ Turning Point',
  tactical: '♟ Tactical',
  checkmate: '♚ Checkmate',
  best_move: '✨ Best Move',
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function FeedCard({ item, index }: { item: FeedItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Link to="/play">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.gradient} p-4 shadow-xl`}
        >
          <motion.div
            className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ repeat: Infinity, duration: 3 }}
          />
          <div className="relative flex items-start justify-between">
            <motion.div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-xl backdrop-blur">
                {item.avatar}
              </span>
              <div>
                <p className="font-semibold text-white">@{item.username}</p>
                <p className="text-xs text-white/70">{TYPE_LABELS[item.type]}</p>
              </div>
            </motion.div>
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: index * 0.3 }}
              className="text-2xl"
            >
              {item.type === 'brilliant' ? '🔥' : item.type === 'blunder' ? '💀' : '⚡'}
            </motion.span>
          </div>

          <h3 className="relative mt-3 font-display text-lg font-bold text-white">
            {item.title}
          </h3>
          <p className="relative mt-1 font-mono text-2xl font-bold text-white/90">
            {item.san}
          </p>

          <div className="relative mt-3 flex items-center justify-between">
            <div className="flex gap-3 text-xs text-white/80">
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {formatCount(item.likes)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {formatCount(item.views)}
              </span>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                item.evalSwing > 0
                  ? 'bg-emerald-500/40 text-white'
                  : 'bg-red-500/40 text-white'
              }`}
            >
              {item.evalSwing > 0 ? '+' : ''}
              {item.evalSwing.toFixed(1)}
            </span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

export function DailyMomentBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass relative overflow-hidden rounded-2xl p-5"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-pulse-500/20 via-neon-pink/20 to-neon-cyan/20"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
      />
      <div className="relative flex items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pulse-500 to-neon-pink text-2xl"
        >
          <Flame className="h-7 w-7 text-white" />
        </motion.div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-pulse-400">
            Daily Moment
          </p>
          <p className="font-display text-lg font-bold">
            Queen sac → Mate in 3
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            12.4k watching live
          </p>
        </div>
      </div>
    </motion.div>
  )
}
