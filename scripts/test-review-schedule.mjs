import assert from 'node:assert/strict';
import test from 'node:test';
await import('../public/review-schedule.js');
const schedule = globalThis.DevPathReviewSchedule;
const now = Date.UTC(2026, 9, 4);

test('success advances intervals, clamps the last interval, and leaves input unchanged', () => {
  const previous = {intervalIndex: 0, dueAt: 1};
  const next = schedule.next(previous, true, now);
  assert.equal(next.intervalIndex, 1);
  assert.equal(next.dueAt, now + 14 * 86400000);
  assert.deepEqual(previous, {intervalIndex: 0, dueAt: 1});
  assert.equal(schedule.next({intervalIndex: 99}, true, now).dueAt, now + 60 * 86400000);
});

test('failure retries tomorrow and a subsequent success restarts at seven days', () => {
  const retry = schedule.next({intervalIndex: 2}, false, now);
  assert.equal(retry.intervalIndex, -1);
  assert.equal(retry.dueAt, now + 86400000);
  assert.equal(schedule.next(retry, true, now).dueAt, now + 7 * 86400000);
  assert.equal(retry.lastReviewedAt, new Date(now).toISOString());
});

test('invalid stored interval is bounded and first completion starts at seven days', () => {
  assert.equal(schedule.next({intervalIndex: Infinity}, true, now).intervalIndex, 1);
  assert.equal(schedule.initial(now).dueAt, now + 7 * 86400000);
});
