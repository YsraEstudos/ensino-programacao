import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const settle = async () => { for (let i = 0; i < 8; i++) await new Promise(resolve => setImmediate(resolve)); };

function harness(putStatus) {
  const dom = new JSDOM('', {url: 'https://example.com', runScripts: 'outside-only'});
  const w = dom.window, statuses = [];
  w.fetch = async (url, opts) => opts?.method
    ? {ok: putStatus < 400, status: putStatus, json: async () => ({revision: 'r1'})}
    : {ok: true, json: async () => ({progress: {}, revision: 'r0', accountKey: 'account-a'})};
  w.eval(readFileSync('public/progress-sync.js', 'utf8'));
  const sync = w.DevPathProgressSync.create({
    snapshot: () => '{"value":1}', status: message => statuses.push(message), issue() {}, merge: (local, remote) => remote
  });
  return {dom, sync, statuses};
}

test('while the account sync is paused, every new save says the progress is kept on this device', async () => {
  const {dom, sync, statuses} = harness(500);
  await sync.load();
  sync.save('{"value":1}');
  await settle();
  assert.equal(sync.ready, false, 'a failed save pauses synchronization');
  statuses.length = 0;
  sync.save('{"value":2}');
  await settle();
  assert.match(statuses.at(-1), /alterações guardadas neste dispositivo; sincronização pausada/);
  assert.notEqual(statuses.at(-1), 'salvando…', 'the status never stays on "salvando…"');
  dom.window.close();
});

test('a conflicting save names the conflict and keeps the attempt on this device', async () => {
  const {dom, sync, statuses} = harness(409);
  await sync.load();
  sync.save('{"value":1}');
  await settle();
  statuses.length = 0;
  sync.save('{"value":2}');
  await settle();
  assert.match(statuses.at(-1), /conflito de sincronização/);
  assert.doesNotMatch(statuses.at(-1), /salvando/);
  dom.window.close();
});
