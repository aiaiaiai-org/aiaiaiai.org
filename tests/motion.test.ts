// © 2026 aiaiaiai · aiaiaiai.org
// SPDX-License-Identifier: MPL-2.0
import assert from 'node:assert/strict';
import test from 'node:test';
import { Motion, pose } from '../src/star-awakening/motion.ts';
import { StageTimeline, pulseFrames } from '../src/star-awakening/stages.ts';

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

test('runtime stages require evidence and preserve the agreed order', () => {
  const timeline = new StageTimeline();
  assert.deepEqual(
    timeline.snapshots().map(({ id, satellite, status }) => ({
      id,
      satellite,
      status,
    })),
    [
      { id: 'downloading', satellite: 'blue', status: 'pending' },
      { id: 'initializing', satellite: 'green', status: 'pending' },
      { id: 'awakening', satellite: 'violet', status: 'pending' },
      { id: 'study', satellite: 'amber', status: 'pending' },
    ],
  );
  assert.equal(timeline.apply({ type: 'start', stage: 'study' }), false);
  assert.equal(timeline.apply({ type: 'complete', stage: 'downloading' }), false);
  for (const stage of [
    'downloading',
    'initializing',
    'awakening',
  ] as const) {
    assert.equal(timeline.apply({ type: 'start', stage }), true);
    assert.equal(timeline.apply({ type: 'start', stage }), false);
    assert.equal(timeline.apply({ type: 'complete', stage }), true);
  }
  assert.deepEqual(
    timeline.snapshots().map((stage) => stage.status),
    ['complete', 'complete', 'complete', 'active'],
  );
  assert.equal(timeline.apply({ type: 'start', stage: 'downloading' }), false);
  assert.equal(timeline.apply({ type: 'start', stage: 'study' }), false);
  // Study never completes or restarts after an inference request.
  assert.equal(timeline.apply({ type: 'complete', stage: 'study' }), false);
  assert.equal(timeline.snapshots()[3]!.status, 'active');
  assert.deepEqual(pulseFrames, [' ___', ' __', ' _', '']);
  assert.equal(
    timeline.apply({
      type: 'fail',
      stage: 'study',
      error: 'runtime unavailable',
    }),
    true,
  );
  assert.equal(timeline.snapshots()[3]!.status, 'failed');
  assert.equal(timeline.apply({ type: 'start', stage: 'study' }), false);
});

test('download byte counts are monotonic and failures never imply success', () => {
  const timeline = new StageTimeline();
  assert.equal(timeline.apply({ type: 'start', stage: 'downloading' }), true);
  assert.equal(
    timeline.apply({
      type: 'progress',
      stage: 'downloading',
      loadedBytes: 512,
      totalBytes: 1024,
    }),
    true,
  );
  assert.equal(
    timeline.apply({
      type: 'progress',
      stage: 'downloading',
      loadedBytes: 128,
      totalBytes: 1024,
    }),
    false,
  );
  assert.equal(
    timeline.apply({ type: 'fail', stage: 'downloading', error: 'network' }),
    true,
  );
  assert.equal(timeline.snapshots()[0]!.status, 'failed');
  assert.equal(timeline.apply({ type: 'start', stage: 'initializing' }), false);
  assert.equal(timeline.apply({ type: 'complete', stage: 'downloading' }), false);
});
