// Progress kept on the device. Saved data is outside input: normalized on load, never trusted.

export type Lang = 'en' | 'ar';
export interface Progress {
  stars: number;
  streak: number;
  best: number;
  muted: boolean;
  lang: Lang | null; // null: follow the device language
}

const KEY = 'popsum';

// Non-negative safe integer, else 0 (tampered or corrupt value).
const count = (v: unknown): number => (Number.isSafeInteger(v) && (v as number) >= 0 ? (v as number) : 0);

// Turns any stored shape into a valid Progress with streak <= best <= stars (each star is one right answer).
export function normalize(raw: unknown): Progress {
  const r = (raw !== null && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const stars = count(r['stars']);
  const streak = Math.min(count(r['streak']), stars);
  return {
    stars,
    streak,
    best: Math.min(Math.max(count(r['best']), streak), stars),
    muted: r['muted'] === true,
    lang: r['lang'] === 'en' || r['lang'] === 'ar' ? r['lang'] : null,
  };
}

// The localStorage getter itself throws in some sandboxes; then the game plays without saving.
export function safeStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch (e) {
    console.warn('popsum: storage blocked, progress will not be kept', e);
    return null;
  }
}

export function load(storage: Storage | null): Progress {
  try {
    return normalize(JSON.parse(storage?.getItem(KEY) ?? 'null'));
  } catch (e) {
    console.warn('popsum: saved progress unreadable, starting fresh', e);
    return normalize(null);
  }
}

export function save(storage: Storage | null, p: Progress): void {
  try {
    storage?.setItem(KEY, JSON.stringify(p));
  } catch (e) {
    console.warn('popsum: progress not saved', e);
  }
}
