import type { Coach } from '../types'

export const COACHES: Coach[] = [
  {
    id: 'grandmaster',
    name: 'Aggressive GM',
    emoji: '♛',
    tagline: 'No mercy. Only wins.',
    color: '#ef4444',
    gradient: 'from-red-500 to-orange-600',
  },
  {
    id: 'teacher',
    name: 'Friendly Teacher',
    emoji: '📚',
    tagline: 'Learn with love.',
    color: '#22c55e',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    id: 'toxic',
    name: 'Toxic Coach',
    emoji: '💀',
    tagline: 'Your moves are trash.',
    color: '#a855f7',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    id: 'anime',
    name: 'Anime Sensei',
    emoji: '⚔️',
    tagline: 'Believe in your pieces!',
    color: '#f472b6',
    gradient: 'from-pink-400 to-violet-500',
  },
  {
    id: 'military',
    name: 'Military Strategist',
    emoji: '🎖️',
    tagline: 'Discipline wins wars.',
    color: '#64748b',
    gradient: 'from-slate-500 to-zinc-600',
  },
]

export function getCoach(id: string): Coach {
  return COACHES.find((c) => c.id === id) ?? COACHES[1]
}
