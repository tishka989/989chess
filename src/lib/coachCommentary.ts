import type { CoachId, CoachComment } from '../types'

type MoveContext = {
  san: string
  swing: number
  isCheck: boolean
  isCapture: boolean
  isMate: boolean
  moveNumber: number
}

const TEMPLATES: Record<
  CoachId,
  Record<string, string[]>
> = {
  grandmaster: {
    brilliant: [
      'Tactical genius. {san} is crushing.',
      'That {san}? Championship level.',
      'Relentless. {san} leaves no escape.',
    ],
    blunder: [
      '{san}?? Unacceptable at this level.',
      'You just collapsed with {san}.',
      'That {san} is how games die.',
    ],
    good: [
      'Precise. {san} keeps pressure.',
      'Good. Maintain the initiative after {san}.',
    ],
    neutral: ['Continue the attack.', 'Stay focused.'],
  },
  teacher: {
    brilliant: [
      'Wonderful! {san} is exactly right. 🌟',
      'Great job — {san} improves your position!',
      'I love {san}! You found the best idea.',
    ],
    blunder: [
      "Let's learn from {san} — there's a better move.",
      'No worries! {san} gives us a teaching moment.',
      'Mistakes help us grow. Rethink after {san}.',
    ],
    good: [
      'Nice! {san} follows opening principles.',
      'Solid {san} — keep developing your pieces.',
    ],
    neutral: ['Think about your next plan.', 'Take your time.'],
  },
  toxic: {
    brilliant: [
      'Okay fine, {san} was... not terrible.',
      'Broken clock moment. {san} actually worked.',
    ],
    blunder: [
      '{san}?? Are you even looking at the board?',
      'My grandma plays better than that {san}.',
      'You just sacrificed your dignity with {san}.',
    ],
    good: ['Barely acceptable. Don\'t get cocky.', '{san}. Meh.'],
    neutral: ['Do something. Anything.', 'Wake up.'],
  },
  anime: {
    brilliant: [
      'SUGOI! {san} — your power level rises! ⚔️',
      'The spirits of chess approve {san}!',
      'This is your protagonist moment — {san}!',
    ],
    blunder: [
      'Your ki dropped... {san} was a dark turn.',
      'Even heroes stumble. {san} cannot define you!',
    ],
    good: [
      'Your training shows! {san} is strong!',
      'Believe in your pieces — {san} proves it!',
    ],
    neutral: ['Focus your spirit.', 'The battle continues!'],
  },
  military: {
    brilliant: [
      '{san} — textbook flanking maneuver. Approved.',
      'Outstanding execution. {san} secures the sector.',
    ],
    blunder: [
      '{san} is a tactical retreat disguised as failure.',
      'Soldier, {san} compromised our position.',
    ],
    good: [
      '{san} maintains formation. Hold the line.',
      'Disciplined play. {san} is sound.',
    ],
    neutral: ['Assess the battlefield.', 'Maintain composure.'],
  },
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function categorize(ctx: MoveContext): string {
  if (ctx.isMate) return 'brilliant'
  if (ctx.swing >= 2) return 'brilliant'
  if (ctx.swing <= -2) return 'blunder'
  if (ctx.swing >= 0.5) return 'good'
  if (ctx.swing <= -0.8) return 'blunder'
  return 'neutral'
}

function severityFor(
  category: string,
  swing: number
): CoachComment['severity'] {
  if (category === 'brilliant' || swing >= 3) return 'epic'
  if (category === 'blunder' || swing <= -2) return 'critical'
  if (category === 'blunder') return 'warning'
  if (category === 'good') return 'good'
  return 'info'
}

export function generateCoachComment(
  coachId: CoachId,
  ctx: MoveContext
): CoachComment {
  const category = categorize(ctx)
  const templates = TEMPLATES[coachId][category] ?? TEMPLATES[coachId].neutral
  let text = pick(templates).replace('{san}', ctx.san)

  if (ctx.isCapture && category === 'brilliant') {
    text += ' Material seized.'
  }
  if (ctx.isCheck && !ctx.isMate) {
    text += ' King under fire!'
  }

  return {
    id: `cc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text,
    moveNumber: ctx.moveNumber,
    severity: severityFor(category, ctx.swing),
    timestamp: Date.now(),
  }
}

export function getPostGameMessage(
  coachId: CoachId,
  result: string
): string {
  const won = result.includes('1-0') || result.includes('white')
  const messages: Record<CoachId, { win: string; loss: string; draw: string }> =
    {
      grandmaster: {
        win: 'Victory earned. Now study your mistakes anyway.',
        loss: 'Defeat is data. Analyze and return stronger.',
        draw: 'A draw is a missed win. Review the endgame.',
      },
      teacher: {
        win: "Amazing game! I'm proud of your progress! 🎉",
        loss: "Great effort! Every game makes you stronger.",
        draw: 'A fair fight! Lots to learn from this one.',
      },
      toxic: {
        win: 'Even you can win sometimes. Don\'t let it go to your head.',
        loss: 'Expected. Maybe try checkers?',
        draw: 'Both of you played like beginners. Impressive.',
      },
      anime: {
        win: 'Your journey continues! The next battle awaits! ⚔️',
        loss: 'Fall seven times, stand eight! Train harder!',
        draw: 'An honorable duel! Your spirit remains unbroken!',
      },
      military: {
        win: 'Mission accomplished, soldier. Debrief and prepare.',
        loss: 'Retreat, regroup, and re-engage. Dismissed.',
        draw: 'Stalemate. Neither side claimed victory.',
      },
    }
  const m = messages[coachId]
  if (result === '1/2-1/2' || result === 'draw') return m.draw
  return won ? m.win : m.loss
}
