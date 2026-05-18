import { Chess, type Move } from 'chess.js'
import type { CoachId } from '../types'
import { evaluatePosition } from './evaluation'

const CENTER_SQUARES = new Set([
  'd4', 'd5', 'e4', 'e5', 'c4', 'c5', 'f4', 'f5',
  'd3', 'e3', 'd6', 'e6', 'c3', 'f3', 'c6', 'f6',
])

const PIECE_ATTACK_VALUE: Record<string, number> = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
}

function findKingSquare(chess: Chess, color: 'w' | 'b'): string | null {
  const board = chess.board()
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const p = board[rank][file]
      if (p?.type === 'k' && p.color === color) {
        return `${String.fromCharCode(97 + file)}${8 - rank}`
      }
    }
  }
  return null
}

function squareDistance(a: string, b: string): number {
  const f1 = a.charCodeAt(0) - 97
  const r1 = parseInt(a[1], 10) - 1
  const f2 = b.charCodeAt(0) - 97
  const r2 = parseInt(b[1], 10) - 1
  return Math.max(Math.abs(f1 - f2), Math.abs(r1 - r2))
}

function evalForMover(fenBefore: string, fenAfter: string, mover: 'w' | 'b'): number {
  const before = evaluatePosition(fenBefore)
  const after = evaluatePosition(fenAfter)
  return mover === 'w' ? after - before : before - after
}

function moveToUci(move: Move): string {
  return move.promotion
    ? `${move.from}${move.to}${move.promotion}`
    : `${move.from}${move.to}`
}

function personalityBonus(
  coachId: CoachId,
  fenBefore: string,
  move: Move,
  mover: 'w' | 'b'
): number {
  const probe = new Chess(fenBefore)
  probe.move(move)
  const evalSwing = evalForMover(fenBefore, probe.fen(), mover)

  const enemyColor = mover === 'w' ? 'b' : 'w'
  const enemyKing = findKingSquare(new Chess(fenBefore), enemyColor)
  const distBefore = enemyKing ? squareDistance(move.from, enemyKing) : 5
  const distAfter = enemyKing ? squareDistance(move.to, enemyKing) : 5
  const captureVal = move.captured ? PIECE_ATTACK_VALUE[move.captured] ?? 0 : 0
  const isCheck = move.san.includes('+')
  const isCapture = move.san.includes('x')
  const isSacrifice = isCapture && evalSwing < -0.4
  const ply = new Chess(fenBefore).moveNumber()

  let bonus = 0

  switch (coachId) {
    case 'grandmaster':
      if (isCheck) bonus += 4
      if (isCapture) bonus += 2.5 + captureVal * 0.4
      if (distAfter < distBefore) bonus += 2
      if (move.piece === 'p' && CENTER_SQUARES.has(move.to)) bonus += 1.2
      if (isSacrifice && (isCheck || distAfter <= 2)) bonus += 5
      if (move.piece === 'q' && distAfter <= 3) bonus += 1.5
      break

    case 'military':
      if (CENTER_SQUARES.has(move.to)) bonus += 1.8
      if (move.san === 'O-O' || move.san === 'O-O-O') bonus += 3.5
      if ((move.piece === 'n' || move.piece === 'b') && ply <= 12) bonus += 2
      if (move.piece === 'r' && 'abcdefgh'.includes(move.to[0])) bonus += 1
      if (isCapture) bonus += captureVal * 0.6
      if (isCheck) bonus += 0.8
      if (isSacrifice) bonus -= 4
      if (move.piece === 'q' && ply < 8) bonus -= 2
      break

    case 'teacher':
      if (isCapture && captureVal > 0) bonus += 2
      if ((move.piece === 'n' || move.piece === 'b') && ply <= 15) bonus += 1.5
      if (move.san === 'O-O' || move.san === 'O-O-O') bonus += 2
      if (isCheck && evalSwing < -0.8) bonus -= 3
      if (isSacrifice) bonus -= 5
      if (move.piece === 'p' && !CENTER_SQUARES.has(move.to) && ply < 10) bonus -= 0.5
      break

    case 'toxic':
      if (isCapture) bonus += 2 + Math.random() * 1.5
      if (isCheck) bonus += 2.5 + Math.random()
      if (move.piece === 'q') bonus += 1.2
      if (evalSwing < -1.5 && isCapture) bonus += 3
      bonus += (Math.random() - 0.5) * 3
      break

    case 'anime':
      if (move.piece === 'n') bonus += 3
      if (move.piece === 'q') bonus += 2.5
      if (isSacrifice) bonus += 6
      if (isCheck) bonus += 2.5
      if (distAfter < distBefore) bonus += 1.5
      if (move.flags.includes('b')) bonus += 2
      if (move.piece === 'p' && parseInt(move.to[1], 10) >= 6) bonus += 1
      break
  }

  return bonus
}

function scoreMove(fen: string, move: Move, coachId: CoachId): number {
  const chess = new Chess(fen)
  const mover = chess.turn()
  const baseEval = evalForMover(
    fen,
    (() => {
      const c = new Chess(fen)
      c.move(move)
      return c.fen()
    })(),
    mover
  )
  const personality = personalityBonus(coachId, fen, move, mover)
  return baseEval * 12 + personality
}

function pickFromPool(
  scored: { move: Move; score: number }[],
  weights: number[]
): Move {
  const pool = scored.slice(0, weights.length)
  const total = weights.slice(0, pool.length).reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i]
    if (r <= 0) return pool[i].move
  }
  return pool[0].move
}

function selectMove(
  scored: { move: Move; score: number }[],
  coachId: CoachId
): Move {
  scored.sort((a, b) => b.score - a.score)
  if (scored.length === 0) throw new Error('no moves')

  switch (coachId) {
    case 'grandmaster': {
      const top = scored[0].score
      const aggressive = scored.filter((s) => s.score >= top - 1.2)
      return aggressive[Math.floor(Math.random() * aggressive.length)].move
    }
    case 'military':
      return scored[0].move

    case 'teacher':
      if (scored.length > 1 && Math.random() < 0.3) return scored[1].move
      if (scored.length > 2 && Math.random() < 0.1) return scored[2].move
      return scored[0].move

    case 'toxic':
      return pickFromPool(scored, [0.12, 0.22, 0.28, 0.22, 0.16])

    case 'anime':
      return pickFromPool(scored, [0.35, 0.3, 0.2, 0.15])

    default:
      return scored[0].move
  }
}

export function getPersonalityMove(fen: string, coachId: CoachId): string | null {
  const chess = new Chess(fen)
  const moves = chess.moves({ verbose: true })
  if (moves.length === 0) return null

  const scored = moves.map((move) => ({
    move,
    score: scoreMove(fen, move, coachId),
  }))

  const chosen = selectMove(scored, coachId)
  return moveToUci(chosen)
}
