// Sum + answer-choice generation. Pure, so tests can pin every level's limits.

export type Op = '+' | '−';
export interface Round {
  a: number;
  b: number;
  op: Op;
  answer: number;
  options: number[];
}
type Rnd = () => number;

// cap: biggest number allowed; sub: subtraction joins addition at this level.
export const LEVELS = [
  { cap: 10, sub: false },
  { cap: 10, sub: true },
  { cap: 20, sub: false },
  { cap: 20, sub: true },
] as const;
export const STARS_PER_LEVEL = 10;

// Level grows with stars, so it never needs its own saved value.
export const levelFor = (stars: number): number =>
  Math.min(LEVELS.length, 1 + Math.floor(stars / STARS_PER_LEVEL));

// Random int in [lo, hi]; rnd() is in [0, 1).
const int = (lo: number, hi: number, rnd: Rnd): number => lo + Math.floor(rnd() * (hi - lo + 1));

// Fisher-Yates in place; returns the same array. Shared with the board's colour pick.
export const shuffle = <T>(xs: T[], rnd: Rnd = Math.random): T[] => {
  for (let i = xs.length - 1; i > 0; i--) {
    const j = int(0, i, rnd);
    [xs[i], xs[j]] = [xs[j] as T, xs[i] as T];
  }
  return xs;
};

// Two wrong answers near the right one (±3) inside 0..cap; answer >= 1 keeps the pool >= 3.
const choices = (answer: number, cap: number, rnd: Rnd): number[] => {
  const near: number[] = [];
  for (let n = Math.max(0, answer - 3); n <= Math.min(cap, answer + 3); n++) if (n !== answer) near.push(n);
  return shuffle([answer, ...shuffle(near, rnd).slice(0, 2)], rnd);
};

// One round: a sum for the level (no zero operands, no negatives) and 3 shuffled options.
export function makeRound(level: number, rnd: Rnd = Math.random): Round {
  const rule = Number.isInteger(level) ? LEVELS[level - 1] : undefined;
  if (!rule) throw new RangeError(`level must be 1..${LEVELS.length}, got ${level}`);
  const { cap, sub } = rule;
  if (sub && rnd() < 0.5) {
    const a = int(2, cap, rnd), b = int(1, a - 1, rnd);
    return { a, b, op: '−', answer: a - b, options: choices(a - b, cap, rnd) };
  }
  const answer = int(2, cap, rnd), a = int(1, answer - 1, rnd);
  return { a, b: answer - a, op: '+', answer, options: choices(answer, cap, rnd) };
}
