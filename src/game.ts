import type { Round } from './math.ts';
import type { Progress } from './store.ts';

// Scores one tap: right adds a star and grows the streak; wrong only resets the streak (stars are never taken).
export function pick(p: Progress, round: Round, value: number): { ok: boolean; progress: Progress } {
  if (value !== round.answer) return { ok: false, progress: { ...p, streak: 0 } };
  const streak = p.streak + 1;
  return { ok: true, progress: { ...p, stars: p.stars + 1, streak, best: Math.max(p.best, streak) } };
}
