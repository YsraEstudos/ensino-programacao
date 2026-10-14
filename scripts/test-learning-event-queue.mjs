import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {loadTsModule} from './load-ts-module.mjs';

const learning = loadTsModule('lib/learning-progress.ts');
const sandbox = {window: {}};
vm.runInNewContext(readFileSync('public/learning-event-queue.js', 'utf8'), sandbox);
const Queue = sandbox.window.DevPathLearningEventQueue;

const context = (fingerprint, overrides = {}) => ({
  contentVersion: 1, assessmentVersion: 1, fingerprint, independent: true, assessmentPassed: false, mode: 'recall', ...overrides
});
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const iso = ms => new Date(ms).toISOString();
const BASE = Date.UTC(2026, 9, 11, 12, 0, 0);

// Mirrors app.js learningEvent: read the record inside the task, stamp with its floor, then reduce.
function submitWith(queue, state, kind, fingerprint, {delay = 0, overrides} = {}) {
  return queue.run(async ({stamp}) => {
    await wait(delay);
    const at = stamp(state.record?.currentUpdatedAt);
    const event = {id: `${kind}-${at}-${Math.random()}`, kind, attemptId: 'attempt-d01', at, fingerprint, source: 'browser'};
    state.record = learning.transitionLearning(state.record, event, context(fingerprint, overrides));
    return state.record;
  });
}

test('a help request made while an earlier edit is still being fingerprinted is not discarded as stale', async () => {
  let tick = 0;
  const queue = Queue.create({now: () => iso(BASE + (tick++) * 1000)});
  const state = {record: null};
  await submitWith(queue, state, 'attempted', 'hash-0');
  const slowEdit = submitWith(queue, state, 'attempted', 'hash-1', {delay: 40});
  const helpDuringEdit = submitWith(queue, state, 'help', 'hash-1', {overrides: {mode: 'recall'}});
  await Promise.all([slowEdit, helpDuringEdit]);
  assert.equal(state.record.assisted, true, 'help survives the edit that was still pending');
  assert.equal(state.record.currentFingerprint, 'hash-1');
  assert.ok(state.record.events.some(event => event.kind === 'help'));
});

test('a record whose clock is two hours ahead still receives a help request', async () => {
  // Another device with a fast clock wrote currentUpdatedAt two hours ahead; this device's clock reads BASE.
  const ahead = iso(BASE + 2 * 3600 * 1000);
  const attempted = learning.transitionLearning(null,
    {id: 'start', kind: 'attempted', attemptId: 'attempt-d01', at: ahead, fingerprint: 'hash-0', source: 'browser'}, context('hash-0'));
  assert.equal(attempted.currentUpdatedAt, ahead);
  const queue = Queue.create({now: () => iso(BASE)});
  const state = {record: attempted};
  await submitWith(queue, state, 'help', 'hash-0');
  assert.equal(state.record.assisted, true, 'the help event is stamped after the record, so the reducer keeps it');
  assert.ok(Date.parse(state.record.currentUpdatedAt) > Date.parse(ahead));
  assert.equal(state.record.events.filter(event => event.kind === 'help').length, 1);
});

test('a clock that moves backwards between two events keeps both, in request order', async () => {
  const times = [BASE + 5000, BASE];
  const queue = Queue.create({now: () => iso(times.length > 1 ? times.shift() : times[0])});
  const state = {record: null};
  await submitWith(queue, state, 'attempted', 'hash-0');
  await submitWith(queue, state, 'help', 'hash-0');
  assert.equal(state.record.events.length, 2, 'both events are applied');
  assert.equal(state.record.assisted, true);
  const [first, second] = state.record.events;
  assert.ok(Date.parse(second.at) > Date.parse(first.at), 'the later event is stamped strictly later');
});

test('events are applied in request order even when a later fingerprint finishes first', async () => {
  let tick = 0;
  const queue = Queue.create({now: () => iso(BASE + (tick++) * 1000)});
  const order = [];
  await Promise.all([
    queue.run(async ({stamp}) => { await wait(30); order.push(stamp()); }),
    queue.run(async ({stamp}) => { await wait(0); order.push(stamp()); })
  ]);
  assert.equal(order.length, 2);
  assert.ok(Date.parse(order[1]) > Date.parse(order[0]), 'stamps follow request order');
});

test('a rejected task is reported once and the events behind it still run', async () => {
  const errors = [];
  const queue = Queue.create({onError: error => errors.push(error.message)});
  const result = await queue.run(async () => { throw new Error('storage unavailable'); });
  const after = await queue.run(async () => 'next event');
  assert.equal(result, null);
  assert.equal(after, 'next event');
  assert.deepEqual(errors, ['storage unavailable']);
});
