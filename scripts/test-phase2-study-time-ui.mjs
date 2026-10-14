import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';

function harness(storageOverride) {
  const dom = new JSDOM('<div id="time"></div>', {url: 'http://localhost/'});
  const window = dom.window;
  let now = 0, visible = true, focused = true, current = {id: '04.01', duration: '13 min'}, tick;
  Object.defineProperty(window.document, 'visibilityState', {get: () => visible ? 'visible' : 'hidden', configurable: true});
  window.document.hasFocus = () => focused;
  window.setInterval = callback => { tick = callback; return 1; };
  window.clearInterval = () => { tick = null; };
  const scope = {};
  vm.runInNewContext(fs.readFileSync('public/study-time.js', 'utf8'), {globalThis: scope});
  vm.runInNewContext(fs.readFileSync('public/study-time-ui.js', 'utf8'), {globalThis: scope});
  const storage = storageOverride || window.localStorage;
  const counter = scope.DevPathStudyTime.create({storage, now: () => now});
  const root = window.document.querySelector('#time');
  const ui = scope.DevPathStudyTimeUI.create({counter, root, window, getActivity: () => current});
  return {
    window, root, ui, counter, storage,
    clock: value => {now = value;}, tick: () => tick?.(),
    select(value) { current = value; window.dispatchEvent(new window.HashChangeEvent('hashchange')); },
    presence(v, f) { visible = v; focused = f; window.document.dispatchEvent(new window.Event('visibilitychange')); window.dispatchEvent(new window.Event(f ? 'focus' : 'blur')); },
    consent(value) { const input = root.querySelector('[data-study-time-consent]'); input.checked = value; input.dispatchEvent(new window.Event('change', {bubbles: true})); },
    close() {ui.dispose(); dom.window.close();}
  };
}

test('UI requires opt-in and counts only current visible focused activity across navigation and dispose', () => {
  const h = harness();
  assert.equal(h.root.querySelector('[data-study-time-consent]').checked, false);
  h.clock(1000); h.tick();
  assert.deepEqual(JSON.parse(JSON.stringify(h.counter.snapshot().activities)), {});
  h.consent(true); h.clock(3000); h.tick();
  assert.match(h.root.textContent, /2 s/);
  assert.match(h.root.textContent, /13 min/);
  h.presence(false, false); h.clock(6000); h.tick();
  assert.equal(h.counter.snapshot().activities['04.01'].milliseconds, 2000);
  h.select({id: '04.02', duration: '10 min'}); h.presence(true, true); h.clock(7000); h.tick();
  assert.equal(h.counter.snapshot().activities['04.02'].milliseconds, 1000);
  h.ui.dispose(); h.clock(9000);
  assert.equal(h.counter.snapshot().activities['04.02'].milliseconds, 1000);
  const saved = JSON.parse(h.storage.getItem('devpath-study-time-v1'));
  assert.deepEqual(Object.keys(saved).sort(), ['activities', 'consent', 'version']);
  assert.deepEqual(Object.keys(saved.activities['04.01']), ['milliseconds']);
  h.close();
});

test('storage revocation stops this tab immediately and never recreates the opted-out record', () => {
  const h = harness();
  h.consent(true); h.clock(1000); h.tick();
  h.storage.removeItem('devpath-study-time-v1');
  h.window.dispatchEvent(new h.window.StorageEvent('storage', {key: 'devpath-study-time-v1', newValue: null}));
  assert.equal(h.root.querySelector('[data-study-time-consent]').checked, false);
  h.clock(4000); h.tick();
  assert.equal(h.storage.getItem('devpath-study-time-v1'), null);
  assert.equal(h.counter.snapshot().consent, false);
  h.close();
});

test('restoring a page from navigation resumes measurement without counting its absence', () => {
  const h = harness();
  h.consent(true); h.clock(1000);
  h.window.dispatchEvent(new h.window.Event('pagehide'));
  h.clock(6000);
  h.window.dispatchEvent(new h.window.Event('pageshow'));
  h.clock(8000); h.tick();
  assert.equal(h.counter.snapshot().activities['04.01'].milliseconds, 3000);
  h.close();
});

test('normal remote updates do not write back and start a cross-tab storage event loop', () => {
  const values = new Map();
  let writes = 0;
  const storage = {getItem: key => values.get(key) || null, setItem(key, value) {writes++; values.set(key, value);}, removeItem: key => values.delete(key)};
  const h = harness(storage);
  h.consent(true);
  storage.setItem('devpath-study-time-v1', JSON.stringify({version: 1, consent: true, activities: {'04.01': {milliseconds: 5000}}}));
  const beforeEvent = writes;
  h.window.dispatchEvent(new h.window.StorageEvent('storage', {key: 'devpath-study-time-v1', newValue: storage.getItem('devpath-study-time-v1')}));
  assert.equal(writes, beforeEvent, 'a remote write does not cause this tab to echo another write');
  assert.equal(h.counter.snapshot().consent, true);
  h.close();
});

test('opt-out clears records, unrelated storage survives, and denied persistence is reported accurately', () => {
  const h = harness();
  h.storage.setItem('learning-answer', 'preserved');
  h.consent(true); h.clock(2000); h.tick(); h.consent(false);
  assert.equal(h.storage.getItem('devpath-study-time-v1'), null);
  assert.equal(h.storage.getItem('learning-answer'), 'preserved');
  h.close();
  const denied = harness({getItem() {return null;}, setItem() {throw new Error('denied');}, removeItem() {throw new Error('denied');}});
  denied.consent(true); denied.clock(3000); denied.tick();
  assert.equal(denied.counter.snapshot().activities['04.01'].milliseconds, 3000);
  assert.match(denied.root.textContent, /não foi possível/i);
  denied.consent(false);
  assert.equal(denied.counter.snapshot().consent, false);
  assert.match(denied.root.textContent, /nesta sessão/i);
  denied.close();
});
