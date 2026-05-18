import { Chess } from 'chess.js'

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
}

const PST: Record<string, number[]> = {
  p: [
    0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, -20, -20, 10, 10, 5, 5, -5, -10, 0, 0, -10, -5, 5,
    0, 0, 0, 20, 20, 0, 0, 0, 5, 5, 10, 25, 25, 10, 5, 5, 10, 10, 20, 30, 30, 20, 10, 10,
    50, 50, 50, 50, 50, 50, 50, 50,
  ],
  n: [
    -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 5, 5, 0, -20, -40, -30, 0, 10, 15,
    15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5,
    10, 15, 15, 10, 5, -30, -40, -20, 0, 0, 0, 0, -20, -40, -50, -40, -30, -30, -30, -30,
    -40, -50,
  ],
}

function squareIndex(file: number, rank: number, color: 'w' | 'b'): number {
  const r = color === 'w' ? rank : 7 - rank
  return r * 8 + file
}

export function evaluatePosition(fen: string): number {
  const chess = new Chess(fen)
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -10000 : 10000
  }
  if (chess.isDraw() || chess.isStalemate()) return 0

  let score = 0
  const board = chess.board()

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file]
      if (!piece) continue
      const val = PIECE_VALUES[piece.type] ?? 0
      const idx = squareIndex(file, rank, piece.color)
      const pst = PST[piece.type]?.[idx] ?? 0
      const total = val + pst
      score += piece.color === 'w' ? total : -total
    }
  }

  return score / 100
}

export function evaluateFromWhitePerspective(fen: string, turn: 'w' | 'b'): number {
  const raw = evaluatePosition(fen)
  return turn === 'w' ? raw : -raw
}
