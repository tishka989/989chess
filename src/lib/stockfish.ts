import type { CoachId } from '../types'
import { getPersonalityMove } from './personalityAI'

const THINK_MS: Record<CoachId, number> = {
  grandmaster: 280,
  military: 450,
  teacher: 520,
  toxic: 180,
  anime: 320,
}

export async function getAIMove(
  fen: string,
  coachId: CoachId = 'teacher'
): Promise<string | null> {
  await new Promise((r) => setTimeout(r, THINK_MS[coachId] ?? 300))
  return getPersonalityMove(fen, coachId)
}
