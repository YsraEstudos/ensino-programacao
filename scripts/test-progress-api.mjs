import assert from 'node:assert/strict';
import test from 'node:test';
import {resolve} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {loadTsModule} from './load-ts-module.mjs';

function setup(initial) {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('CREATE TABLE user_progress (user_id TEXT PRIMARY KEY, progress_json TEXT NOT NULL, updated_at INTEGER NOT NULL)');
  if (initial !== undefined) sqlite.prepare('INSERT INTO user_progress VALUES (?, ?, 0)').run('test-user', initial);
  const db = {prepare(sql) {return {bind(...args) {return {
    async first() {return sqlite.prepare(sql).get(...args) || null;},
    async run() {return {meta: {changes: Number(sqlite.prepare(sql).run(...args).changes)}};}
  };}};}};
  const route = loadTsModule('app/api/progress/route.ts', {
    [resolve('db/index.ts')]: {getD1: () => db},
    [resolve('app/chatgpt-auth.ts')]: {getChatGPTUser: async () => ({userId: 'test-user'})}
  });
  const put = (body, revision) => route.PUT(new Request('http://localhost/api/progress', {
    method: 'PUT', headers: {'Content-Type': 'application/json', ...(revision ? {'If-Match': revision} : {})},
    body: typeof body === 'string' ? body : JSON.stringify(body)
  }));
  return {route, put, sqlite};
}

test('corrupt stored progress is reported and cannot be replaced by empty data', async () => {
  const env = setup('{broken');
  try {
    assert.equal((await env.route.GET()).status, 503);
    assert.equal((await env.put({}, 'empty')).status, 503);
    assert.equal(env.sqlite.prepare('SELECT progress_json FROM user_progress').get().progress_json, '{broken');
  } finally {env.sqlite.close();}
});

test('invalid JSON and non-object payloads return 400, missing revision returns 428', async () => {
  const env = setup();
  try {
    const state = await (await env.route.GET()).json();
    assert.equal((await env.put('{broken', state.revision)).status, 400);
    assert.equal((await env.put('[]', state.revision)).status, 400);
    assert.equal((await env.put({})).status, 428);
    assert.equal(env.sqlite.prepare('SELECT count(*) AS n FROM user_progress').get().n, 0);
  } finally {env.sqlite.close();}
});

test('two clients cannot overwrite each other from the same initial revision', async () => {
  const env = setup();
  try {
    const {revision} = await (await env.route.GET()).json();
    assert.equal(typeof revision, 'string');
    const responses = await Promise.all([
      env.put({exerciseDrafts: {'04.01': 'primeira aba'}}, revision),
      env.put({exerciseDrafts: {'04.01': 'segunda aba'}}, revision)
    ]);
    assert.deepEqual(responses.map(response => response.status).sort(), [200, 409]);
    const fresh = await (await env.route.GET()).json();
    assert.notEqual(fresh.revision, revision);
    assert.equal((await env.put({exerciseDrafts: {'04.01': 'obsoleto'}}, revision)).status, 409);
    assert.equal((await env.put({...fresh.progress, exerciseDrafts: {'04.01': 'atualizado'}}, fresh.revision)).status, 200);
  } finally {env.sqlite.close();}
});

test('streaming request size is limited in bytes before parsing and cancels excess input', async () => {
  const env = setup();
  try {
    const {revision} = await (await env.route.GET()).json();
    let cancelled = false;
    const chunk = new TextEncoder().encode('á'.repeat(300000));
    const request = new Request('http://localhost/api/progress', {method: 'PUT', duplex: 'half',
      headers: {'If-Match': revision}, body: new ReadableStream({
        pull(controller) {controller.enqueue(chunk);}, cancel() {cancelled = true;}
      })});
    assert.equal((await env.route.PUT(request)).status, 413);
    assert.equal(cancelled, true);
    assert.equal(env.sqlite.prepare('SELECT count(*) AS n FROM user_progress').get().n, 0);
  } finally {env.sqlite.close();}
});

test('legacy valid rows load without a migration and return a revision', async () => {
  const env = setup(JSON.stringify({answers: {'00.01': true}, exerciseDrafts: {'04.01': 'rascunho antigo'}}));
  try {
    const response = await env.route.GET();
    assert.equal(response.status, 200);
    const state = await response.json();
    assert.equal(state.progress.answers['00.01'], true);
    assert.equal(state.progress.exerciseDrafts['04.01'], 'rascunho antigo');
    assert.equal(typeof state.revision, 'string');
  } finally {env.sqlite.close();}
});
