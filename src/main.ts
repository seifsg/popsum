import './styles/fonts.css';
import './styles/app.css';
import './styles/balloon.css';
import { miss, onKeys, pop, showRound } from './board.ts';
import { pick } from './game.ts';
import * as hud from './hud.ts';
import { cheer, pickLang, t } from './i18n.ts';
import { levelFor, makeRound, type Round } from './math.ts';
import { play } from './sound.ts';
import { load, safeStorage, save, type Lang, type Progress } from './store.ts';

// Composition root: owns the game state and the round loop.
const storage = safeStorage();
let progress: Progress = load(storage);
let round: Round = makeRound(levelFor(progress.stars));
let busy = false; // true while a pop plays: extra taps are ignored

// Current language: the saved choice, else the device's.
const lang = (): Lang => pickLang(progress.lang, navigator.languages ?? [navigator.language]);

// Single write path: keep, save and show the new progress.
function commit(next: Progress): void {
  progress = next;
  save(storage, progress);
  hud.score(progress, levelFor(progress.stars), lang());
}

// A repeated sum would look like the tap did nothing; every level has dozens of sums, so this ends fast.
const sameSum = (x: Round, y: Round): boolean => x.a === y.a && x.b === y.b && x.op === y.op;

// Starts a new round with a different sum and releases the input lock.
function nextRound(): void {
  const prev = round;
  do round = makeRound(levelFor(progress.stars));
  while (sameSum(round, prev));
  showRound(round, onPick);
  busy = false;
}

// Handles one balloon tap: score it, give feedback, then pop and move on or let the child retry.
async function onPick(btn: HTMLButtonElement, value: number): Promise<void> {
  if (busy) return;
  const before = levelFor(progress.stars);
  const { ok, progress: next } = pick(progress, round, value);
  commit(next);
  if (!progress.muted) play(ok ? 'pop' : 'boop');
  hud.say(cheer(lang(), ok));
  if (!ok) return miss(btn);
  busy = true;
  await pop(btn);
  const after = levelFor(progress.stars);
  if (after > before) hud.banner(t(lang(), 'levelUp', after));
  nextRound();
}

// Sound switch: flips and saves mute.
function toggleMute(): void {
  commit({ ...progress, muted: !progress.muted });
  hud.setMuted(progress.muted);
}

// Language switch: flips English/Arabic, saves it and redraws every label.
function toggleLang(): void {
  commit({ ...progress, lang: lang() === 'ar' ? 'en' : 'ar' });
  hud.applyLang(lang(), progress.muted);
  hud.say(t(lang(), 'ask'));
}

hud.applyLang(lang(), progress.muted);
hud.score(progress, levelFor(progress.stars), lang());
hud.say(t(lang(), 'ask'));
hud.onSwitches(toggleMute, toggleLang);
onKeys();
showRound(round, onPick);
