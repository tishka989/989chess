import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import type { CoachComment, CoachId } from '../types'
import { getCoach } from '../data/coaches'

interface CoachContextValue {
  coachId: CoachId
  coach: ReturnType<typeof getCoach>
  comments: CoachComment[]
  setCoachId: (id: CoachId) => void
  addComment: (comment: CoachComment) => void
  clearComments: () => void
}

const CoachContext = createContext<CoachContextValue | null>(null)

export function CoachProvider({ children }: { children: ReactNode }) {
  const [coachId, setCoachId] = useState<CoachId>(() => {
    const saved = localStorage.getItem('checkpulse-coach')
    return (saved as CoachId) || 'anime'
  })
  const [comments, setComments] = useState<CoachComment[]>([])

  const setCoach = useCallback((id: CoachId) => {
    setCoachId(id)
    localStorage.setItem('checkpulse-coach', id)
  }, [])

  const addComment = useCallback((comment: CoachComment) => {
    setComments((prev) => [...prev.slice(-20), comment])
  }, [])

  const clearComments = useCallback(() => setComments([]), [])

  return (
    <CoachContext.Provider
      value={{
        coachId,
        coach: getCoach(coachId),
        comments,
        setCoachId: setCoach,
        addComment,
        clearComments,
      }}
    >
      {children}
    </CoachContext.Provider>
  )
}

export function useCoach() {
  const ctx = useContext(CoachContext)
  if (!ctx) throw new Error('useCoach must be used within CoachProvider')
  return ctx
}
