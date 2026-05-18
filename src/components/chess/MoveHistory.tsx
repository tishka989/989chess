import { Chess } from 'chess.js'
import { motion } from 'framer-motion'

interface MoveHistoryProps {
  pgn: string
}

export function MoveHistory({ pgn }: MoveHistoryProps) {
  const chess = new Chess()
  try {
    chess.loadPgn(pgn)
  } catch {
    return null
  }

  const moves = chess.history()
  const pairs: { num: number; white: string; black?: string }[] = []

  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    })
  }

  if (pairs.length === 0) return null

  return (
    <div className="glass max-h-48 overflow-y-auto rounded-2xl p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
        Move History
      </p>
      <motion.div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-1 text-sm font-mono">
        {pairs.map((p) => (
          <motion.div key={p.num} className="contents">
            <span className="text-[var(--text-secondary)]">{p.num}.</span>
            <span>{p.white}</span>
            <span>{p.black ?? ''}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
