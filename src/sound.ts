// Tiny synthesized sound effects (no music, no audio files to download or cache).

const TONES = {
  pop: { type: 'triangle', from: 520, to: 1250, dur: 0.14, vol: 0.28 },
  boop: { type: 'sine', from: 330, to: 220, dur: 0.22, vol: 0.18 },
} as const;
export type Sound = keyof typeof TONES;

let ctx: AudioContext | null = null;
let warned = false;

// Created on the first tap: browsers only allow audio after a user gesture.
function audio(): AudioContext | null {
  if (ctx) return ctx;
  if (typeof AudioContext === 'undefined') {
    if (!warned) console.warn('popsum: Web Audio unavailable, sounds off');
    warned = true;
    return null;
  }
  return (ctx = new AudioContext());
}

export function play(kind: Sound): void {
  const ac = audio();
  if (!ac) return;
  if (ac.state === 'suspended') void ac.resume();
  const { type, from, to, dur, vol } = TONES[kind];
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur);
}
