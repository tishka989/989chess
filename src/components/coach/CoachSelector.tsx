import { motion } from 'framer-motion'
import clsx from 'clsx'
import { COACHES } from '../../data/coaches'
import { useCoach } from '../../context/CoachContext'
import type { CoachId } from '../../types'

export function CoachSelector({ compact = false }: { compact?: boolean }) {
  const { coachId, setCoachId } = useCoach()

  return (
    <div className={compact ? 'flex gap-2 overflow-x-auto pb-1' : 'grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5'}>
      {COACHES.map((coach, i) => (
        <motion.button
          key={coach.id}
          type="button"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCoachId(coach.id as CoachId)}
          className={clsx(
            'relative overflow-hidden rounded-2xl border text-left transition-all',
            compact ? 'min-w-[120px] shrink-0 p-3' : 'p-4',
            coachId === coach.id
              ? 'border-pulse-400 bg-pulse-500/15 shadow-lg shadow-pulse-500/20'
              : 'border-[var(--bg-glass-border)] bg-[var(--bg-glass)] hover:border-white/20'
          )}
        >
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${coach.gradient} opacity-10`}
            animate={{ opacity: coachId === coach.id ? 0.2 : 0.05 }}
          />
          <span className="relative text-2xl">{coach.emoji}</span>
          <p className="relative mt-1 font-semibold text-sm">{coach.name}</p>
          {!compact && (
            <p className="relative mt-0.5 text-xs text-[var(--text-secondary)]">
              {coach.tagline}
            </p>
          )}
        </motion.button>
      ))}
    </div>
  )
}
