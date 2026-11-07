import { byId } from './dom.ts';
import { shuffle, type Round } from './math.ts';

// The sum and its 3 rising balloons.
const sum = byId('sum');
const sky = byId('sky');

const COLORS = 5; // .c0 .. .c4 in balloon.css
const LANES = [1 / 6, 3 / 6, 5 / 6]; // lane centres, left to right (keys 1, 2, 3)
const KEYS = ['123', '١٢٣']; // Latin and Arabic-Indic digits

export type PickHandler = (btn: HTMLButtonElement, value: number) => void;

const rand = (lo: number, hi: number): number => lo + Math.random() * (hi - lo);

// Three different colours for this round.
const palette = (): number[] => shuffle(Array.from({ length: COLORS }, (_, i) => i)).slice(0, 3);

// One balloon; motion values are CSS variables (CSSOM writes are CSP-safe).
function balloon(value: number, lane: number, color: number, onPick: PickHandler): HTMLButtonElement {
  const btn = document.createElement('button');
  const dur = rand(9, 12);
  btn.type = 'button';
  btn.className = `balloon c${color}`;
  btn.setAttribute('aria-label', String(value));
  btn.style.setProperty('--x', `${((LANES[lane] ?? 0.5) + rand(-0.035, 0.035)) * 100}%`);
  btn.style.setProperty('--dur', `${dur.toFixed(2)}s`);
  btn.style.setProperty('--delay', `${(-dur * rand(0.3, 0.55)).toFixed(2)}s`);
  btn.style.setProperty('--sway', `${rand(2.6, 3.6).toFixed(2)}s`);
  btn.style.setProperty('--rest', `${rand(14, 42).toFixed(0)}%`);
  const body = document.createElement('span');
  body.className = 'b';
  body.textContent = String(value);
  btn.append(body);
  btn.addEventListener('click', () => onPick(btn, value));
  return btn;
}

export function showRound(round: Round, onPick: PickHandler): void {
  const q = document.createElement('span');
  q.className = 'q';
  q.textContent = '?';
  sum.replaceChildren(`${round.a} ${round.op} ${round.b} = `, q);
  const colors = palette();
  const keyboard = sky.contains(document.activeElement); // keep keyboard users in the sky
  sky.replaceChildren(...round.options.map((v, i) => balloon(v, i, colors[i] ?? i, onPick)));
  if (keyboard) (sky.firstElementChild as HTMLElement | null)?.focus();
}

// Plays the pop; resolves when it ends (or is cancelled), so the next round never starts early.
export function pop(btn: HTMLButtonElement): Promise<void> {
  return new Promise((done) => {
    const end = (e: AnimationEvent): void => {
      if (e.type === 'animationcancel' || e.animationName === 'pop') done();
    };
    btn.addEventListener('animationend', end);
    btn.addEventListener('animationcancel', end);
    btn.classList.add('popped');
  });
}

// A wrong balloon wobbles, then dims and stops taking taps.
export function miss(btn: HTMLButtonElement): void {
  btn.classList.add('missed');
  btn.disabled = true;
}

// Keys 1-3 tap the balloons left to right.
export function onKeys(): void {
  document.addEventListener('keydown', (e) => {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    const i = KEYS.reduce((found, row) => (found >= 0 ? found : row.indexOf(e.key)), -1);
    const btn = sky.children[i];
    if (btn instanceof HTMLButtonElement && !btn.disabled) btn.click();
  });
}
