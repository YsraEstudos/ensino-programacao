import {withPublicDependencies} from './public-test-source.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {JSDOM} from 'jsdom';
const root = new URL('../public/', import.meta.url);
const catalog = JSON.parse(readFileSync(new URL('course-catalog.json', root)));
const settle = async () => {for (let i=0;i<6;i++) await new Promise(resolve => setImmediate(resolve));};

async function load({loadFails = false, conflict = false, backup} = {}) {
  const dom = new JSDOM(readFileSync(new URL('devpath.html', root), 'utf8'), {
    url: 'https://devpath.example/devpath.html#/catalog', runScripts: 'outside-only'
  });
  const requests = [];
  const w = dom.window;
  if (backup) w.sessionStorage.setItem('devpath-pending:test-account', JSON.stringify(backup));
  w.fetch = async (url, options = {}) => {
    if (url === '/course-catalog.json') return {ok: true, json: async () => catalog};
    if (url === '/api/profile') return {ok: false};
    if (options.method === 'PUT') {
      requests.push(options);
      return {ok: !conflict, status: conflict ? 409 : 200, json: async () => ({saved: true, revision: '"saved"'})};
    }
    return {ok: !loadFails, status: loadFails ? 503 : 200,
      json: async () => ({progress: {}, revision: '"empty"', accountKey: 'test-account'})};
  };
  for (const script of w.document.querySelectorAll('script[src]')) {
    w.eval(withPublicDependencies(readFileSync(new URL(new URL(script.src).pathname.slice(1), root), 'utf8')));
  }
  await settle();
  return {dom, w, requests};
}

test('failed initial loading never triggers automatic or navigation saves', async () => {
  const env = await load({loadFails: true});
  try {
    env.w.location.hash = '#/home'; await settle();
    assert.equal(env.requests.length, 0);
    assert.match(env.w.document.querySelector('#view').textContent, /carregar.*progresso/i);
  } finally {env.dom.window.close();}
});

test('save sends the loaded revision and a conflict preserves the pending attempt', async () => {
  const env = await load({conflict: true});
  try {
    assert.equal(env.requests[0].headers['If-Match'], '"empty"');
    assert.match(env.w.document.querySelector('#progress-sync-issue').textContent, /outra aba|dispositivo/);
    const backup = JSON.parse(env.w.sessionStorage.getItem('devpath-pending:test-account'));
    assert.equal(backup.progress.activeDays.length, 1);
    env.w.location.hash = '#/home'; await settle();
    assert.equal(env.requests.length, 1);
  } finally {env.dom.window.close();}
});

test('reloading with a pending attempt does not silently erase or replace it', async () => {
  const backup = {progress: {exerciseDrafts: {'04.01': 'minha tentativa preservada'}}};
  const env = await load({backup});
  try {
    assert.equal(env.requests.length, 0);
    assert.match(env.w.document.querySelector('#progress-sync-issue').textContent, /tentativa.*sincronizada/i);
    assert.deepEqual(JSON.parse(env.w.sessionStorage.getItem('devpath-pending:test-account')), backup);
  } finally {env.dom.window.close();}
});
