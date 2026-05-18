import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clapperboard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GameBoard } from '../components/chess/GameBoard'
import { MoveHistory } from '../components/chess/MoveHistory'
import { CoachBubble } from '../components/coach/CoachBubble'
import { CoachSelector } from '../components/coach/CoachSelector'
import { ReelsViewer } from '../components/reels/ReelsViewer'
import { useCoach } from '../context/CoachContext'
import { useAuth } from '../context/AuthContext'
import { analyzeGame } from '../lib/gameAnalysis'
import { getPostGameMessage } from '../lib/coachCommentary'
import type { GameHighlight } from '../types'

export function PlayPage() {
  const { coachId, coach, clearComments } = useCoach()
  const { saveGame } = useAuth()
  const [pgn, setPgn] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [highlights, setHighlights] = useState<GameHighlight[]>([])
  const [showReels, setShowReels] = useState(false)
  const [postGameMsg, setPostGameMsg] = useState('')

  const handleGameEnd = useCallback(
    async (gamePgn: string, gameResult: string, playerColor: 'w' | 'b') => {
      setPgn(gamePgn)
      setResult(gameResult)
      const hl = analyzeGame(gamePgn)
      setHighlights(hl)
      setPostGameMsg(getPostGameMessage(coachId, gameResult))
      setShowReels(true)

      await saveGame({
        pgn: gamePgn,
        result: gameResult,
        playerColor,
        playedAt: new Date().toISOString(),
        highlights: hl,
        coachId,
      })
    },
    [coachId, saveGame]
  )

  const newGame = () => {
    setPgn('')
    setResult(null)
    setHighlights([])
    setShowReels(false)
    setPostGameMsg('')
    clearComments()
  }

  return (
    <div className="space-y-6 pb-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-2xl font-bold">Play vs AI</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Coach: {coach.emoji} {coach.name}
          </p>
        </div>
        {result && (
          <button
            type="button"
            onClick={newGame}
            className="rounded-xl bg-pulse-500/20 px-4 py-2 text-sm font-semibold text-pulse-400"
          >
            New Game
          </button>
        )}
      </motion.div>

      {!showReels ? (
        <>
          <CoachSelector compact />
          <CoachBubble />
          <GameBoard onGameEnd={handleGameEnd} vsAI />
          {pgn && <MoveHistory pgn={pgn} />}
        </>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="glass rounded-2xl p-4 text-center"
            >
              <span className="text-4xl">{coach.emoji}</span>
              <p className="mt-2 font-semibold">Game Over — {result}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {postGameMsg}
              </p>
            </motion.div>

            <ReelsViewer highlights={highlights} title="Your Match Reel 🎬" />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={newGame}
                className="flex-1 rounded-2xl bg-gradient-to-r from-pulse-500 to-neon-pink py-3 font-semibold text-white"
              >
                Play Again
              </button>
              <Link
                to="/reels"
                className="glass flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 font-semibold"
              >
                <Clapperboard className="h-5 w-5" />
                All Reels
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
