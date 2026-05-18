import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  Heart,
  Share2,
} from 'lucide-react'
import type { GameHighlight } from '../../types'
import { HighlightCard } from './HighlightCard'

interface ReelsViewerProps {
  highlights: GameHighlight[]
  title?: string
  gameLabel?: string
}

export function ReelsViewer({
  highlights,
  title = 'Match Reel',
  gameLabel,
}: ReelsViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    setActiveIndex(0)
    setLiked(false)
  }, [highlights])

  const next = useCallback(
    () => setActiveIndex((i) => Math.min(i + 1, highlights.length - 1)),
    [highlights.length]
  )
  const prev = useCallback(
    () => setActiveIndex((i) => Math.max(i - 1, 0)),
    []
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next()
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  const handleShare = async () => {
    const h = highlights[activeIndex]
    if (!h) return
    const text = `${h.emoji} ${h.label}: ${h.san}\n${h.explanation}\n— CheckPulse`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Chess Reel', text })
      } else {
        await navigator.clipboard.writeText(text)
        alert('Copied to clipboard!')
      }
    } catch {
      /* user cancelled */
    }
  }

  if (highlights.length === 0) {
    return (
      <div className="glass flex min-h-[50dvh] flex-col items-center justify-center rounded-3xl p-8 text-center">
        <p className="text-5xl">🎬</p>
        <p className="mt-3 font-display text-lg font-bold">No highlights yet</p>
        <p className="mt-2 max-w-xs text-sm text-[var(--text-secondary)]">
          Play a full game — we auto-detect brilliant moves, blunders, and turning
          points for your reel.
        </p>
      </div>
    )
  }

  const atStart = activeIndex === 0
  const atEnd = activeIndex === highlights.length - 1

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto w-full max-w-md"
    >
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-bold">{title}</h2>
          {gameLabel && (
            <p className="text-xs text-[var(--text-secondary)]">{gameLabel}</p>
          )}
        </div>
        <motion.div className="flex gap-2">
          <button
            type="button"
            onClick={() => setLiked((l) => !l)}
            className={`glass flex h-9 w-9 items-center justify-center rounded-full transition ${
              liked ? 'text-neon-pink' : ''
            }`}
            aria-label="Like"
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="glass flex h-9 w-9 items-center justify-center rounded-full"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </motion.div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeIndex}-${highlights[activeIndex]?.id}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.y < -60 || info.velocity.y < -400) next()
              else if (info.offset.y > 60 || info.velocity.y > 400) prev()
            }}
            className="touch-pan-y"
          >
            <HighlightCard
              highlight={highlights[activeIndex]}
              index={activeIndex}
              active
            />
          </motion.div>
        </AnimatePresence>

        {!atEnd && (
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-white/50"
          >
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          type="button"
          disabled={atStart}
          onClick={prev}
          className="glass flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-30"
          aria-label="Previous clip"
        >
          <ChevronUp className="h-5 w-5" />
        </button>

        <motion.div className="flex gap-1.5">
          {highlights.map((h, i) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex ? 'w-7 bg-pulse-400' : 'w-1.5 bg-white/25'
              }`}
              aria-label={`Clip ${i + 1}`}
            />
          ))}
        </motion.div>

        <button
          type="button"
          disabled={atEnd}
          onClick={next}
          className="glass flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-30"
          aria-label="Next clip"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>

      <p className="mt-2 text-center text-xs text-[var(--text-secondary)]">
        Swipe ↑ next • Swipe ↓ prev • {activeIndex + 1} / {highlights.length}
      </p>
    </motion.div>
  )
}
