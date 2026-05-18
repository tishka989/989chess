import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { motion } from 'framer-motion'
import { FlipVertical, RotateCcw } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useCoach } from '../../context/CoachContext'
import { generateCoachComment } from '../../lib/coachCommentary'
import { evaluateFromWhitePerspective } from '../../lib/evaluation'
import { getAIMove } from '../../lib/stockfish'

interface GameBoardProps {
  onGameEnd: (pgn: string, result: string, playerColor: 'w' | 'b') => void
  vsAI?: boolean
}

export function GameBoard({ onGameEnd, vsAI = true }: GameBoardProps) {
  const { theme } = useTheme()
  const { coachId, addComment, clearComments } = useCoach()
  const [game, setGame] = useState(() => new Chess())
  const [boardOrientation, setBoardOrientation] =
    useState<'white' | 'black'>('white')
  const [aiThinking, setAiThinking] = useState(false)
  const [lastEval, setLastEval] = useState(0)
  const endedRef = useRef(false)
  const aiRunIdRef = useRef(0)

  const fen = game.fen()
  const isGameOver = game.isGameOver()
  const playerColor = boardOrientation === 'white' ? 'w' : 'b'

  const gameResult = useMemo(() => {
    if (!isGameOver) return null
    if (game.isCheckmate()) {
      return game.turn() === 'w' ? '0-1' : '1-0'
    }
    return '1/2-1/2'
  }, [game, isGameOver])

  useEffect(() => {
    if (gameResult && !endedRef.current) {
      endedRef.current = true
      onGameEnd(game.pgn(), gameResult, playerColor)
    }
  }, [gameResult, game, onGameEnd])

  const makeCoachComment = useCallback(
    (san: string, swing: number, moveNum: number) => {
      addComment(
        generateCoachComment(coachId, {
          san,
          swing,
          isCheck: san.includes('+'),
          isCapture: san.includes('x'),
          isMate: san.includes('#'),
          moveNumber: moveNum,
        })
      )
    },
    [coachId, addComment]
  )

  const applyMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      let success = false
      setGame((prev) => {
        const copy = new Chess(prev.fen())
        const fenBefore = copy.fen()
        const evalBefore = evaluateFromWhitePerspective(fenBefore, copy.turn())

        try {
          const move = copy.move({
            from,
            to,
            ...(promotion
              ? { promotion: promotion as 'q' | 'r' | 'b' | 'n' }
              : {}),
          })
          if (!move) return prev

          const evalAfter = evaluateFromWhitePerspective(
            copy.fen(),
            copy.turn()
          )
          const swing =
            move.color === 'w' ? evalAfter - evalBefore : evalBefore - evalAfter

          setLastEval(evalAfter)
          makeCoachComment(move.san, swing, Math.ceil(copy.moveNumber() / 2))
          success = true
          return copy
        } catch {
          return prev
        }
      })
      return success
    },
    [makeCoachComment]
  )

  const applyMoveRef = useRef(applyMove)
  applyMoveRef.current = applyMove

  const onDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      sourceSquare: string
      targetSquare: string | null
    }) => {
      if (!targetSquare || aiThinking || isGameOver) return false
      if (game.turn() !== playerColor) return false

      const isPromotion =
        (playerColor === 'w' &&
          sourceSquare[1] === '7' &&
          targetSquare[1] === '8') ||
        (playerColor === 'b' &&
          sourceSquare[1] === '2' &&
          targetSquare[1] === '1')

      return applyMove(
        sourceSquare,
        targetSquare,
        isPromotion ? 'q' : undefined
      )
    },
    [applyMove, aiThinking, isGameOver, game, playerColor]
  )

  // AI turn — fen triggers this; aiThinking must NOT be in deps (was cancelling the timer)
  useEffect(() => {
    if (!vsAI || isGameOver) return
    if (game.turn() === playerColor) return

    const runId = ++aiRunIdRef.current
    setAiThinking(true)

    ;(async () => {
      try {
        const move = await getAIMove(fen, coachId)
        if (runId !== aiRunIdRef.current) return

        if (move && move.length >= 4) {
          const from = move.slice(0, 2)
          const to = move.slice(2, 4)
          const promo = move.length > 4 ? move[4] : undefined
          applyMoveRef.current(from, to, promo)
        }
      } finally {
        if (runId === aiRunIdRef.current) {
          setAiThinking(false)
        }
      }
    })()

    return () => {
      aiRunIdRef.current += 1
    }
  }, [fen, vsAI, isGameOver, playerColor, coachId])

  const restart = () => {
    aiRunIdRef.current += 1
    endedRef.current = false
    clearComments()
    setGame(new Chess())
    setLastEval(0)
    setAiThinking(false)
  }

  const flip = () =>
    setBoardOrientation((o) => (o === 'white' ? 'black' : 'white'))

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div className="relative w-full max-w-[min(100vw-2rem,480px)]">
        {aiThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="h-10 w-10 rounded-full border-2 border-pulse-400 border-t-transparent"
            />
          </motion.div>
        )}
        <Chessboard
          options={{
            position: fen,
            onPieceDrop: onDrop,
            boardOrientation,
            allowDragging: !aiThinking && !isGameOver,
            animationDurationInMs: 200,
            darkSquareStyle: {
              backgroundColor: theme === 'dark' ? '#3d4f6f' : '#b58863',
            },
            lightSquareStyle: {
              backgroundColor: theme === 'dark' ? '#5a6d8a' : '#f0d9b5',
            },
            boardStyle: {
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            },
          }}
        />
      </motion.div>

      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="glass rounded-xl px-4 py-2 text-sm">
          Eval:{' '}
          <span
            className={
              lastEval > 0.5
                ? 'text-emerald-400'
                : lastEval < -0.5
                  ? 'text-red-400'
                  : ''
            }
          >
            {lastEval > 0 ? '+' : ''}
            {lastEval.toFixed(1)}
          </span>
        </div>
        {isGameOver && gameResult && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="rounded-xl bg-gradient-to-r from-pulse-500 to-neon-pink px-4 py-2 text-sm font-bold"
          >
            {gameResult}
          </motion.span>
        )}
      </motion.div>

      <motion.div className="flex gap-2">
        <button
          type="button"
          onClick={restart}
          className="glass flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-white/10"
        >
          <RotateCcw className="h-4 w-4" />
          Restart
        </button>
        <button
          type="button"
          onClick={flip}
          className="glass flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-white/10"
        >
          <FlipVertical className="h-4 w-4" />
          Flip
        </button>
      </motion.div>
    </div>
  )
}
