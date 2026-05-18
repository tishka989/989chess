import { motion } from 'framer-motion'
import type { GameHighlight } from '../../types'
import { MiniBoard } from '../chess/MiniBoard'

const TYPE_GRADIENTS: Record<string, string> = {
  brilliant: 'from-amber-500 via-orange-500 to-red-600',
  blunder: 'from-purple-600 via-pink-600 to-red-500',
  turning_point: 'from-cyan-400 via-blue-500 to-indigo-600',
  tactical: 'from-emerald-400 to-teal-600',
  checkmate: 'from-violet-500 via-purple-600 to-fuchsia-600',
  best_move: 'from-slate-500 to-zinc-600',
}

interface HighlightCardProps {
  highlight: GameHighlight
  index: number
  active?: boolean
}

export function HighlightCard({
  highlight,
  index,
  active = false,
}: HighlightCardProps) {
  const gradient = TYPE_GRADIENTS[highlight.type] ?? TYPE_GRADIENTS.best_move

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-3xl shadow-2xl ${
        active ? 'ring-2 ring-white/30' : ''
      }`}
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`}
        animate={active ? { scale: [1, 1.03, 1] } : {}}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <div className="relative flex min-h-[min(72dvh,520px)] flex-col justify-between p-6 text-white">
        <div>
          <motion.span
            animate={active ? { scale: [1, 1.15, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="inline-block text-4xl"
          >
            {highlight.emoji}
          </motion.span>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest opacity-80">
            {highlight.label}
          </p>
          <h3 className="mt-1 font-display text-3xl font-bold">{highlight.san}</h3>
          <p className="mt-1 text-sm opacity-80">Move {highlight.moveNumber}</p>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-relaxed opacity-95">
              {highlight.explanation}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-lg bg-black/30 px-3 py-1.5 text-xs">
                Before: {highlight.evalBefore > 0 ? '+' : ''}
                {highlight.evalBefore.toFixed(1)}
              </span>
              <span
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                  highlight.evalSwing > 0
                    ? 'bg-emerald-500/40'
                    : 'bg-red-500/40'
                }`}
              >
                {highlight.evalSwing > 0 ? '+' : ''}
                {highlight.evalSwing.toFixed(1)}
              </span>
            </div>
          </div>
          <MiniBoard fen={highlight.fen} size={112} />
        </div>
        <p className="mt-4 text-center text-[10px] opacity-50">
          #{index + 1} • CheckPulse Reel
        </p>
      </div>
    </motion.div>
  )
}
