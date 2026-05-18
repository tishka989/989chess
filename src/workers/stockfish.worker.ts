// Lightweight analysis worker — uses heuristic eval when Stockfish WASM unavailable
import { Chess } from 'chess.js'

const PIECE_VAL: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 0,
}

function evaluate(fen: string): number {
  const chess = new Chess(fen)
  if (chess.isCheckmate()) return chess.turn() === 'w' ? -9999 : 9999
  let s = 0
  for (const row of chess.board()) {
    for (const p of row) {
      if (!p) continue
      const v = PIECE_VAL[p.type] ?? 0
      s += p.color === 'w' ? v : -v
    }
  }
  return s
}

function search(fen: string, depth: number): string {
  const chess = new Chess(fen)
  const moves = chess.moves({ verbose: true })
  if (moves.length === 0) return ''

  if (depth <= 0) {
    const m = moves[Math.floor(Math.random() * moves.length)]
    return m.promotion ? `${m.from}${m.to}${m.promotion}` : `${m.from}${m.to}`
  }

  const isMax = chess.turn() === 'w'
  let best = moves[0]
  let bestScore = isMax ? -Infinity : Infinity

  for (const m of moves.slice(0, 12)) {
    chess.move(m)
    const nextFen = chess.fen()
    chess.undo()

    const childMoves = new Chess(nextFen).moves({ verbose: true })
    let score: number
    if (childMoves.length === 0) {
      score = evaluate(nextFen)
    } else {
      const child = new Chess(nextFen)
      const cm = childMoves[0]
      child.move(cm)
      score = evaluate(child.fen())
    }

    if (isMax ? score > bestScore : score < bestScore) {
      bestScore = score
      best = m
    }
  }

  return best.promotion
    ? `${best.from}${best.to}${best.promotion}`
    : `${best.from}${best.to}`
}

self.onmessage = (e: MessageEvent<string>) => {
  const msg = e.data
  if (msg === 'init') {
    self.postMessage('ready')
    return
  }
  if (msg.startsWith('position fen ')) {
    const fen = msg.replace('position fen ', '')
    ;(self as unknown as { _fen: string })._fen = fen
    return
  }
  if (msg.startsWith('go')) {
    const fen = (self as unknown as { _fen: string })._fen
    if (!fen) return
    const depthMatch = msg.match(/depth (\d+)/)
    const depth = depthMatch ? parseInt(depthMatch[1], 10) : 3
    const move = search(fen, Math.min(depth, 4))
    self.postMessage(`bestmove ${move}`)
  }
}
