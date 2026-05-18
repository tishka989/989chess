import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Play, Sparkles, TrendingUp } from 'lucide-react'
import { FeedCard, DailyMomentBanner } from '../components/feed/FeedCard'
import { TRENDING_FEED } from '../data/feed'
import { CoachSelector } from '../components/coach/CoachSelector'

export function HomePage() {
  return (
    <div className="space-y-6 pb-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2"
      >
        <h1 className="font-display text-3xl font-bold leading-tight md:text-4xl">
          Chess hits
          <br />
          <span className="gradient-text">different here.</span>
        </h1>
        <p className="mt-2 max-w-md text-[var(--text-secondary)]">
          Play. Get roasted by your AI coach. Auto-generate viral reels from every match.
        </p>

        <motion.div
          className="mt-5 flex flex-wrap gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            to="/play"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pulse-500 to-neon-pink px-6 py-3 font-semibold text-white shadow-xl shadow-pulse-500/30 transition hover:shadow-pulse-500/50"
          >
            <Play className="h-5 w-5 fill-current" />
            Play Now
          </Link>
          <Link
            to="/reels"
            className="glass flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold transition hover:bg-white/10"
          >
            <Sparkles className="h-5 w-5 text-neon-cyan" />
            My Reels
          </Link>
        </motion.div>
      </motion.section>

      <DailyMomentBanner />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <TrendingUp className="h-5 w-5 text-neon-amber" />
            Trending Moments
          </h2>
          <span className="text-xs text-[var(--text-secondary)]">Live feed</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {TRENDING_FEED.map((item, i) => (
            <FeedCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Pick Your Coach</h2>
        <CoachSelector compact />
      </section>
    </div>
  )
}
