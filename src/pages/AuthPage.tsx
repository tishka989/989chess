import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function AuthPage() {
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    navigate('/profile')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const err =
      mode === 'signup'
        ? await signUp(email, password, username || 'Player')
        : await signIn(email, password)

    setLoading(false)
    if (err) setError(err)
    else navigate('/')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md pt-8"
    >
      <motion.div className="mb-8 text-center">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pulse-500 to-neon-pink shadow-xl shadow-pulse-500/40"
        >
          <Zap className="h-8 w-8 text-white" />
        </motion.div>
        <h1 className="font-display text-2xl font-bold">
          {mode === 'signup' ? 'Join CheckPulse' : 'Welcome back'}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Save games, reels & coach preferences
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="glass space-y-4 rounded-2xl p-6">
        {mode === 'signup' && (
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-[var(--bg-glass-border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm outline-none focus:border-pulse-400"
              placeholder="your_handle"
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[var(--bg-glass-border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm outline-none focus:border-pulse-400"
            placeholder="you@email.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[var(--bg-glass-border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm outline-none focus:border-pulse-400"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-pulse-500 to-neon-pink py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Loading...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
        </button>

        <p className="text-center text-sm text-[var(--text-secondary)]">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
            className="font-semibold text-pulse-400"
          >
            {mode === 'signup' ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </form>

      <p className="mt-4 text-center text-xs text-[var(--text-secondary)]">
        <Link to="/" className="text-pulse-400">
          Continue as guest →
        </Link>
      </p>

      {!import.meta.env.VITE_SUPABASE_URL && (
        <p className="mt-2 text-center text-[10px] text-[var(--text-secondary)]">
          Demo mode: auth saved locally. Add Supabase env vars for cloud sync.
        </p>
      )}
    </motion.div>
  )
}
