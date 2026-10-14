import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function setup(saved) {
  const entries = new Map(saved ? [['devpath-study-time-v1', JSON.stringify(saved)]] : []);
  let at = 0;
  const storage = {getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key)};
  const context = vm.createContext({});
  vm.runInContext(readFileSync(new URL('../public/study-time.js', import.meta.url), 'utf8'), context);
  const timer = context.DevPathStudyTime.create({storage, now: () => at});
  return {timer, storage, entries, create: () => context.DevPathStudyTime.create({storage, now: () => at}), advance: milliseconds => at += milliseconds};
}

test('time is off by default and records only consented visible focused activity time', () => {
  const env = setup(), timer = env.timer;
  timer.activity('04.10'); timer.presence({visible: true, focused: true}); env.advance(1000); timer.flush();
  assert.equal(timer.snapshot().consent, false); assert.equal(env.entries.size, 0);
  timer.consent(true); env.advance(2200); timer.presence({visible: true, focused: false});
  env.advance(30000); timer.presence({visible: false, focused: true}); env.advance(5000);
  timer.presence({visible: true, focused: true}); env.advance(800); timer.flush();
  assert.equal(timer.snapshot().activities['04.10'].milliseconds, 3000);
  assert.deepEqual(Object.keys(JSON.parse(env.entries.get('devpath-study-time-v1'))).sort(), ['activities', 'consent', 'version']);
  assert.deepEqual(Object.keys(timer.snapshot().activities['04.10']), ['milliseconds']);
});

test('navigation, reload and opt-out preserve totals then erase local records', () => {
  const env = setup(), timer = env.timer;
  timer.presence({visible: true, focused: true}); timer.consent(true); timer.activity('11.08');
  env.advance(1200); timer.activity('12.08'); env.advance(500); timer.activity(null); env.advance(5000); timer.flush();
  const state = JSON.parse(env.entries.get('devpath-study-time-v1'));
  assert.equal(state.activities['11.08'].milliseconds, 1200);
  assert.equal(state.activities['12.08'].milliseconds, 500);
  const reloaded = setup(state); assert.equal(reloaded.timer.snapshot().activities['11.08'].milliseconds, 1200);
  reloaded.timer.consent(false); reloaded.advance(9999); reloaded.timer.flush();
  assert.equal(reloaded.entries.size, 0); assert.equal(Object.keys(reloaded.timer.snapshot().activities).length, 0);
});

test('malformed storage and denied persistence do not break learning', () => {
  const env = setup({version: 1, consent: true, activities: {'04.10': {milliseconds: -100}, '../bad': {milliseconds: 10}, '11.08': {milliseconds: 1200, answer: 'private'}}});
  assert.equal(env.timer.snapshot().activities['04.10'], undefined);
  assert.equal(env.timer.snapshot().activities['../bad'], undefined);
  assert.equal(JSON.stringify(env.timer.snapshot()).includes('private'), false);
  env.storage.setItem = () => {throw new Error('Storage denied');};
  env.timer.presence({visible: true, focused: true}); env.timer.activity('04.10'); env.advance(10);
  assert.doesNotThrow(() => env.timer.flush());
  assert.equal(env.timer.snapshot().activities['04.10'].milliseconds, 10);
});

test('missing storage reports failed persistence while the counter works in memory', () => {
  let at = 0;
  const context = vm.createContext({});
  vm.runInContext(readFileSync(new URL('../public/study-time.js', import.meta.url), 'utf8'), context);
  const timer = context.DevPathStudyTime.create({now: () => at});
  assert.equal(timer.consent(true), false);
  timer.presence({visible: true, focused: true}); timer.activity('04.10'); at = 1000;
  assert.equal(timer.flush(), false);
  assert.equal(timer.snapshot().activities['04.10'].milliseconds, 1000);
  assert.equal(timer.consent(false), false);
  assert.equal(Object.keys(timer.snapshot().activities).length, 0);
});

test('two tabs preserve separate activity totals and cannot restore revoked consent', () => {
  const env = setup(), first = env.timer;
  first.consent(true);
  const second = env.create();
  first.activity('04.10'); first.presence({visible: true, focused: true});
  second.activity('11.08');
  env.advance(1000); first.presence({visible: true, focused: false});
  second.presence({visible: true, focused: true}); env.advance(500); second.presence({visible: true, focused: false});
  const saved = JSON.parse(env.entries.get('devpath-study-time-v1'));
  assert.equal(saved.activities['04.10'].milliseconds, 1000);
  assert.equal(saved.activities['11.08'].milliseconds, 500);
  first.consent(false);
  second.activity('12.08'); second.presence({visible: true, focused: true}); env.advance(1000); second.flush();
  assert.equal(env.entries.has('devpath-study-time-v1'), false);
  assert.equal(second.snapshot().consent, false);
});
