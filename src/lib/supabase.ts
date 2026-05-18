import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && key)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, key)
  : null

export interface DbProfile {
  id: string
  username: string
  avatar_emoji: string
  coach_id: string
  theme: 'dark' | 'light'
}

export interface DbGame {
  id: string
  user_id: string
  pgn: string
  result: string
  highlights: unknown
  coach_id: string
  created_at: string
}
