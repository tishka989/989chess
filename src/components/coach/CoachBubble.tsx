import { AnimatePresence, motion } from 'framer-motion'
import { useCoach } from '../../context/CoachContext'
import type { CoachComment } from '../../types'

const SEVERITY_STYLES: Record<CoachComment['severity'], string> = {
  info: 'border-white/10',
  good: 'border-emerald-500/40 bg-emerald-500/10',
  warning: 'border-amber-500/40 bg-amber-500/10',
  critical: 'border-red-500/40 bg-red-500/10',
  epic: 'border-pulse-400/50 bg-gradient-to-r from-pulse-500/20 to-neon-pink/20',
}

export function CoachBubble() {
  const { coach, comments } = useCoach()
  const latest = comments[comments.length - 1]

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {latest ? (
          <motion.div
            key={latest.id}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className={`glass flex gap-3 rounded-2xl border p-4 ${SEVERITY_STYLES[latest.severity]}`}
          >
            <motion.span
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.5 }}
              className="text-3xl"
            >
              {coach.emoji}
            </motion.span>
            <motion.div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                {coach.name}
              </p>
              <p className="mt-1 text-sm font-medium leading-snug">{latest.text}</p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-4 text-center text-sm text-[var(--text-secondary)]"
          >
            <span className="text-2xl">{coach.emoji}</span>
            <p className="mt-2">{coach.tagline}</p>
            <p className="mt-1 text-xs opacity-70">Your coach is watching...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
