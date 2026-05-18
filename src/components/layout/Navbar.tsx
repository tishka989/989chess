import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Moon, Sun, Zap } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

export function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const location = useLocation()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
    >
      <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-2.5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pulse-500 to-neon-pink text-lg font-bold text-white shadow-lg shadow-pulse-500/30">
            <Zap className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            989<span className="gradient-text">Chess</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { to: '/', label: 'Feed' },
            { to: '/play', label: 'Play' },
            { to: '/reels', label: 'Reels' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                location.pathname === to
                  ? 'bg-pulse-500/20 text-pulse-400'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <motion.div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="glass flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-white/10"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <Link
            to={user ? '/profile' : '/auth'}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pulse-500 to-neon-pink px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-pulse-500/25"
          >
            <span className="text-base">{user?.avatar ?? '♟'}</span>
            <span className="hidden sm:inline">
              {user ? user.username : 'Sign in'}
            </span>
          </Link>
        </motion.div>
      </div>
    </motion.header>
  )
}
