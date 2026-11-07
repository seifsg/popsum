import { byId, replay } from './dom.ts';
import { t } from './i18n.ts';
import type { Lang, Progress } from './store.ts';

// Score pills, message line, level banner and the two switches.
const el = {
  stars: byId('stars'),
  streak: byId('streak'),
  best: byId('best'),
  level: byId('level'),
  msg: byId('msg'),
  banner: byId('banner'),
  mute: byId<HTMLButtonElement>('mute'),
  lang: byId<HTMLButtonElement>('lang'),
};

// Writes a pill's number and spoken label; bumps it when the number grows.
function pill(node: HTMLElement, label: string, n: number): void {
  const b = node.querySelector('b');
  if (!b) throw new Error('popsum: pill without <b>');
  if (n > Number(b.textContent)) replay(node, 'bump');
  b.textContent = String(n);
  node.setAttribute('aria-label', `${label}: ${n}`);
}

export function score(p: Progress, level: number, lang: Lang): void {
  pill(el.stars, t(lang, 'stars'), p.stars);
  pill(el.streak, t(lang, 'streak'), p.streak);
  pill(el.best, t(lang, 'best'), p.best);
  pill(el.level, t(lang, 'level'), level);
}

export function say(text: string): void {
  el.msg.textContent = text;
  replay(el.msg, 'pulse');
}

export function banner(text: string): void {
  el.banner.textContent = text;
  replay(el.banner, 'show');
}

// Sets page language, direction and every fixed label.
export function applyLang(lang: Lang, muted: boolean): void {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  const word = el.level.querySelector('.word');
  if (word) word.textContent = t(lang, 'level');
  el.lang.textContent = t(lang, 'switchLang');
  el.lang.setAttribute('aria-label', t(lang, 'switchLangLabel'));
  el.mute.setAttribute('aria-label', t(lang, 'sound'));
  setMuted(muted);
}

export function setMuted(muted: boolean): void {
  el.mute.textContent = muted ? '🔇' : '🔊';
  el.mute.setAttribute('aria-pressed', String(!muted));
}

export function onSwitches(onMute: () => void, onLang: () => void): void {
  el.mute.addEventListener('click', onMute);
  el.lang.addEventListener('click', onLang);
}
