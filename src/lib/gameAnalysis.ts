import { Chess } from 'chess.js'
import type { GameHighlight, HighlightType } from '../types'
import { evaluateFromWhitePerspective } from './evaluation'

const HIGHLIGHT_META: Record<
  HighlightType,
  { emoji: string; label: string }
> = {
  brilliant: { emoji: '🔥', label: 'Brilliant Move' },
  blunder: { emoji: '💀', label: 'Massive Blunder' },
  turning_point: { emoji: '⚡', label: 'Turning Point' },
  tactical: { emoji: '♟', label: 'Tactical Combo' },
  checkmate: { emoji: '♚', label: 'Checkmate' },
  best_move: { emoji: '✨', label: 'Best Move' },
}

function classifySwing(swing: number, isMate: boolean): HighlightType {
  if (isMate) return 'checkmate'
  const abs = Math.abs(swing)
  if (abs >= 5) return swing > 0 ? 'brilliant' : 'blunder'
  if (abs >= 2.5) return swing > 0 ? 'turning_point' : 'blunder'
  if (abs >= 1.2) return swing > 0 ? 'tactical' : 'blunder'
  if (abs >= 0.5) return 'best_move'
  return 'best_move'
}

function generateExplanation(
  type: HighlightType,
  san: string,
  swing: number
): string {
  const abs = Math.abs(swing).toFixed(1)
  switch (type) {
    case 'brilliant':
      return `${san} swings the eval by +${abs} — textbook brilliance.`
    case 'blunder':
      return `${san} drops ${abs} pawns of advantage. Ouch.`
    case 'turning_point':
      return `${san} completely flips the momentum (+${abs}).`
    case 'tactical':
      return `Sharp tactics in ${san} — ${abs} pawn swing.`
    case 'checkmate':
      return `Game over. ${san} seals it.`
    default:
      return `Solid ${san} — engine-approved.`
  }
}

export function analyzeGame(pgn: string): GameHighlight[] {
  const chess = new Chess()
  try {
    chess.loadPgn(pgn)
  } catch {
    return []
  }

  const history = chess.history({ verbose: true })
  if (history.length === 0) return []

  const replay = new Chess()
  const moments: {
    moveNumber: number
    san: string
    fen: string
    swing: number
    evalBefore: number
    evalAfter: number
    isMate: boolean
  }[] = []

  for (let i = 0; i < history.length; i++) {
    const move = history[i]
    const fenBefore = replay.fen()
    const evalBefore = evaluateFromWhitePerspective(
      fenBefore,
      replay.turn()
    )
    replay.move(move.san)
    const fenAfter = replay.fen()
    const evalAfter = evaluateFromWhitePerspective(fenAfter, replay.turn())
    const swing =
      move.color === 'w' ? evalAfter - evalBefore : evalBefore - evalAfter
    const isMate = replay.isCheckmate()

    moments.push({
      moveNumber: Math.ceil((i + 1) / 2),
      san: move.san,
      fen: fenAfter,
      swing,
      evalBefore,
      evalAfter,
      isMate,
    })
  }

  const sorted = [...moments]
    .filter((m) => Math.abs(m.swing) >= 0.8 || m.isMate)
    .sort((a, b) => Math.abs(b.swing) - Math.abs(a.swing))

  const top = sorted.slice(0, 6)

  return top.map((m, idx) => {
    const type = classifySwing(m.swing, m.isMate)
    const meta = HIGHLIGHT_META[type]
    return {
      id: `hl-${idx}-${m.san}`,
      type,
      moveNumber: m.moveNumber,
      san: m.san,
      fen: m.fen,
      evalBefore: m.evalBefore,
      evalAfter: m.evalAfter,
      evalSwing: m.swing,
      explanation: generateExplanation(type, m.san, m.swing),
      emoji: meta.emoji,
      label: meta.label,
    }
  })
}
