// © 2026 aiaiaiai · aiaiaiai.org
// SPDX-License-Identifier: MPL-2.0
import assert from 'node:assert/strict';
import test from 'node:test';
import { Motion, pose } from '../src/star-awakening/motion.ts';

function settle(motion: Motion, hz = 60) {
  for (let i = 0; i < hz * 4; i++) motion.step(1 / hz);
}

test('activation exchanges actual depth with four stable satellite identities', () => {
  const motion = new Motion();
  const before = pose(motion.depth, 0);
  assert.equal(before.satellites.length, 4);
  assert.ok(before.satellites.every((s) => s.z < before.starZ));
  motion.press();
  assert.equal(motion.activate(), true);
  assert.equal(motion.activate(), false);
  settle(motion);
  const after = pose(motion.depth, 0);
  assert.equal(motion.phase, 'settled');
  assert.ok(after.starZ < before.starZ);
  assert.ok(after.satellites.every((s) => s.z > after.starZ));
  assert.deepEqual(
    after.satellites.map((s) => s.id),
    before.satellites.map((s) => s.id),
  );
});

test('cancel restores compression and never advances depth', () => {
  const motion = new Motion();
  motion.press();
  for (let i = 0; i < 20; i++) motion.step(1 / 60);
  assert.ok(motion.compression > 0.4);
  motion.cancel();
  settle(motion);
  assert.equal(motion.phase, 'idle');
  assert.equal(motion.depth, 0);
  assert.ok(Math.abs(motion.compression) < 0.001);
});

test('spring is bounded after tab suspension and consistent across refresh rates', () => {
  for (const hz of [30, 60, 120]) {
    const motion = new Motion();
    motion.activate();
    motion.step(300);
    assert.ok(motion.depth < 0.3);
    settle(motion, hz);
    assert.equal(motion.depth, 1);
  }
});

test('reduced motion keeps semantic depth exchange without orbit or overshoot', () => {
  const motion = new Motion();
  motion.press();
  motion.activate();
  motion.step(1 / 60, true);
  assert.equal(motion.depth, 1);
  assert.equal(motion.compression, 0);
  assert.equal(motion.phase, 'settled');
});
