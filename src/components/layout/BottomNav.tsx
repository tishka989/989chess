import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clapperboard, Home, Swords, User } from 'lucide-react'

const NAV = [
  { to: '/', icon: Home, label: 'Feed' },
  { to: '/play', icon: Swords, label: 'Play' },
  { to: '/reels', icon: Clapperboard, label: 'Reels' },
  { to: '/profile', icon: User, label: 'You' },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 md:hidden">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass mx-auto flex max-w-md items-center justify-around rounded-2xl py-2"
      >
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className="relative flex flex-col items-center gap-0.5 px-4 py-1"
            >
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-xl bg-pulse-500/20"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`relative h-5 w-5 ${
                  active ? 'text-pulse-400' : 'text-[var(--text-secondary)]'
                }`}
              />
              <span
                className={`relative text-[10px] font-medium ${
                  active ? 'text-pulse-400' : 'text-[var(--text-secondary)]'
                }`}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </motion.div>
    </nav>
  )
}
