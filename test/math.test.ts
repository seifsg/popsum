import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, levelFor, makeRound } from '../src/math.ts';

// Seeded LCG so failures replay exactly.
const seeded = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
const always = (v: number) => () => v;

test('every round fits its level: sum right, no negatives, 3 distinct options in 0..cap', () => {
  const rnd = seeded(42);
  LEVELS.forEach(({ cap, sub }, i) => {
    const ops = new Set();
    for (let n = 0; n < 2000; n++) {
      const { a, b, op, answer, options } = makeRound(i + 1, rnd);
      ops.add(op);
      assert.equal(op === '+' ? a + b : a - b, answer);
      for (const x of [a, b, answer]) assert.ok(x >= 1 && x <= cap, `${a}${op}${b}=${answer} out of 1..${cap}`);
      assert.equal(new Set(options).size, 3);
      assert.equal(options.filter((o) => o === answer).length, 1);
      for (const o of options) assert.ok(Number.isInteger(o) && o >= 0 && o <= cap && Math.abs(o - answer) <= 3);
    }
    assert.deepEqual([...ops].sort(), sub ? ['+', '−'] : ['+']);
  });
});

test('edge rolls keep 3 options at the smallest and biggest answers', () => {
  for (const level of [1, 2, 3, 4]) {
    for (const r of [always(0), always(0.999999)]) {
      const { answer, options } = makeRound(level, r);
      assert.equal(new Set(options).size, 3);
      assert.ok(options.includes(answer));
    }
  }
});

test('level rises every 10 stars and stops at the top', () => {
  assert.deepEqual([0, 9, 10, 19, 20, 30, 1e9].map(levelFor), [1, 1, 2, 2, 3, 4, 4]);
});

test('unknown level is rejected loudly', () => {
  for (const bad of [0, 5, 1.5, NaN]) assert.throws(() => makeRound(bad), RangeError);
});
