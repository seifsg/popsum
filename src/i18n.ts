import type { Lang } from './store.ts';

// Every on-screen word, per language. Digits and the sum stay left-to-right in both.
const STRINGS = {
  en: {
    ask: 'Pop the balloon with the answer!',
    stars: 'Stars',
    streak: 'Streak',
    best: 'Best streak',
    level: 'Level',
    levelUp: 'Level {n}! 🎉',
    sound: 'Sound',
    switchLang: 'عربي',
    switchLangLabel: 'العربية: switch to Arabic',
    right: ['Yay! 🎉', 'Super! ⭐', 'You got it! 🎈', 'Brilliant! 🌟', 'Great job! 👏'],
    wrong: ['Almost! Try again 🙂', 'Nice try! Look again 👀', 'Oops! Try another one 🎈'],
  },
  ar: {
    ask: 'افقع البالون الذي يحمل الجواب!',
    stars: 'النجوم',
    streak: 'إجابات متتالية',
    best: 'أفضل سلسلة',
    level: 'المستوى',
    levelUp: 'المستوى {n}! 🎉',
    sound: 'الصوت',
    switchLang: 'EN',
    switchLangLabel: 'English: التبديل إلى الإنجليزية',
    right: ['رائع! 🎉', 'ممتاز! ⭐', 'أحسنت! 🎈', 'برافو! 🌟', 'عمل جميل! 👏'],
    wrong: ['قريب! حاول مرة أخرى 🙂', 'محاولة جميلة! انظر مجددًا 👀', 'جرّب بالونًا آخر 🎈'],
  },
} as const;

type Text = Exclude<keyof (typeof STRINGS)['en'], 'right' | 'wrong'>;

// Saved choice wins; else the first device language we support; else English.
export function pickLang(saved: Lang | null, device: readonly string[]): Lang {
  if (saved) return saved;
  const first = device.map((l) => l.slice(0, 2).toLowerCase()).find((l) => l === 'en' || l === 'ar');
  return first === 'ar' ? 'ar' : 'en';
}

export const t = (lang: Lang, key: Text, n?: number): string =>
  STRINGS[lang][key].replace('{n}', String(n ?? ''));

// A random kind line after a tap.
export function cheer(lang: Lang, ok: boolean, rnd: () => number = Math.random): string {
  const lines = STRINGS[lang][ok ? 'right' : 'wrong'];
  return lines[Math.floor(rnd() * lines.length)] ?? lines[0];
}
