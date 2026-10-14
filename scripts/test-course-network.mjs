import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

function api() {
  const window = {Response, Headers, DOMException, AbortController, setTimeout, clearTimeout};
  window.window = window;
  vm.runInNewContext(readFileSync('public/course-network.js', 'utf8'), {window});
  return window.DevPathNetwork;
}

function clock() {
  let now = 0;
  let next = 1;
  const timers = new Map();
  return {
    now: () => now,
    setTimeout(fn, delay = 0) { const id = next++; timers.set(id, {at: now + delay, fn}); return id; },
    clearTimeout(id) { timers.delete(id); },
    advance(ms) {
      const end = now + ms;
      while (true) {
        const due = [...timers.entries()].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) break;
        timers.delete(due[0]); now = due[1].at; due[1].fn();
      }
      now = end;
    },
    pending: () => timers.size,
  };
}

test('network fixtures preserve Response semantics for errors and invalid JSON', async () => {
  const c = clock();
  const fixtures = api().createNetworkFixtures([
    {method: 'GET', url: '/missing', status: 404, body: 'gone'},
    {method: 'GET', url: '/bad-json', status: 200, body: '{oops'},
    {method: 'GET', url: '/empty', status: 204},
  ], c);
  const missing = await fixtures.fetch('/missing');
  assert.equal(missing.status, 404);
  assert.equal(missing.ok, false);
  assert.equal(await missing.text(), 'gone');
  await assert.rejects(() => fixtures.fetch('/bad-json').then(response => response.json()), SyntaxError);
  const empty = await fixtures.fetch('/empty');
  assert.equal(empty.status, 204);
  assert.equal(await empty.text(), '');
  assert.equal(fixtures.requests.length, 3);
});

test('network fixtures support deterministic delay, abort, reset, and late out-of-order responses', async () => {
  const c = clock();
  const fixtures = api().createNetworkFixtures([
    {method: 'GET', url: '/slow', delay: 30, body: 'A', lateAfterAbort: true},
    {method: 'GET', url: '/fast', delay: 5, body: 'B'},
  ], c);
  const controller = new AbortController();
  const slow = fixtures.fetch('/slow', {signal: controller.signal});
  const fast = fixtures.fetch('/fast');
  c.advance(5);
  assert.equal(await fast.then(response => response.text()), 'B');
  controller.abort();
  await assert.rejects(slow, error => error?.name === 'AbortError');
  c.advance(25);
  assert.equal(fixtures.requests[0].delivered, true);
  assert.equal(c.pending(), 0);
  fixtures.reset();
  assert.equal(fixtures.requests.length, 0);
  const again = fixtures.fetch('/slow');
  c.advance(30);
  assert.equal(await again.then(response => response.text()), 'A');
});

test('network fixtures never fall through to the real network', async () => {
  const fixtures = api().createNetworkFixtures([], clock());
  await assert.rejects(() => fixtures.fetch('https://example.com/real'), /fixture|route|local/i);
});

test('serialized network factory is self-contained in an opaque-like realm', async () => {
  const source = api().source;
  const frame = {Response, Headers, DOMException, AbortController, setTimeout, clearTimeout};
  frame.globalThis = frame;
  vm.runInNewContext(`globalThis.factory=${source}`, frame);
  const fixture = frame.factory([{method: 'GET', url: '/opaque', status: 200, body: 'ok'}], clock());
  assert.equal(await fixture.fetch('/opaque').then(response => response.text()), 'ok');
});

test('an explicit late fixture can deliver an aborted old response for sequence-token tests', async () => {
  const c = clock();
  const fixtures = api().createNetworkFixtures([
    {method: 'GET', url: '/old', delay: 30, body: 'A', ignoreAbort: true},
    {method: 'GET', url: '/new', delay: 5, body: 'B'},
  ], c);
  const oldController = new AbortController();
  const old = fixtures.fetch('/old', {signal: oldController.signal});
  const newer = fixtures.fetch('/new');
  c.advance(5);
  assert.equal(await newer.then(response => response.text()), 'B');
  oldController.abort();
  c.advance(25);
  assert.equal(await old.then(response => response.text()), 'A');
  fixtures.reset();
  assert.equal(fixtures.requests.length, 0);
  assert.equal(c.pending(), 0);
});

test('reset cancels an aborted late fixture before its delivery timer fires', async () => {
  const c = clock();
  const fixtures = api().createNetworkFixtures([
    {method: 'GET', url: '/old', delay: 30, body: 'A', lateAfterAbort: true},
  ], c);
  const controller = new AbortController();
  const old = fixtures.fetch('/old', {signal: controller.signal});
  controller.abort();
  await assert.rejects(old, error => error?.name === 'AbortError');
  assert.equal(c.pending(), 1);
  fixtures.reset();
  assert.equal(fixtures.requests.length, 0);
  assert.equal(c.pending(), 0);
  c.advance(30);
});
