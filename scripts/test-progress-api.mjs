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

test('sanitized learning attempts roundtrip through the API beside legacy completion and drafts', async () => {
  const env = setup();
  try {
    const initial = await (await env.route.GET()).json();
    const record = {schemaVersion: 1, contentVersion: 1, assessmentVersion: 2, mode: 'recall', state: 'demonstrated',
      assisted: false, attemptId: 'attempt-1', attemptIndependent: true, currentFingerprint: 'sha256:current', currentUpdatedAt: '2026-10-11T12:00:00.000Z', verifiedEvidence: {
        attemptId: 'attempt-1', contentVersion: 1, assessmentVersion: 2, fingerprint: 'sha256:current',
        source: 'browser', at: '2026-10-11T12:00:00.000Z'
      }, demonstratedEvidence: {
        attemptId: 'attempt-1', contentVersion: 1, assessmentVersion: 2, fingerprint: 'sha256:current',
        source: 'browser', at: '2026-10-11T12:00:00.000Z'
      }, events: [{id: 'event-help', kind: 'help', attemptId: 'attempt-1', at: '2026-10-11T11:59:00.000Z',
        fingerprint: 'sha256:current', assisted: false, source: 'browser'}, ...Array.from({length: 12}, (_, index) => ({
        id: `later-${index}`, kind: 'attempted', attemptId: 'attempt-1',
        at: new Date(Date.UTC(2026, 9, 11, 12, 1, index)).toISOString(),
        fingerprint: 'sha256:current', source: 'browser'
      }))]};
    const payload = {...initial.progress, completed: ['04.01'], answers: {'04.01': true},
      exerciseDrafts: {'04.01': 'preserved'}, exerciseReflections: {'04.01': 'reflection stays'}, exerciseEvidence: {'04.01': {status: 'executed', runResult: 'result',
        output: 'ok', rubric: [0], rubricFingerprint: `sha256:${'b'.repeat(64)}`, runCount: 1, testsPassed: true}}, exerciseLearning: {'04.01': record}};
    assert.equal((await env.put(payload, initial.revision)).status, 200);
    const saved = await (await env.route.GET()).json();
    assert.equal(saved.progress.exerciseLearning['04.01'].attemptId, 'attempt-1');
    assert.equal(saved.progress.exerciseLearning['04.01'].assisted, true);
    assert.equal(saved.progress.exerciseLearning['04.01'].state, 'verified');
    assert.equal(saved.progress.exerciseLearning['04.01'].events.length, 12);
    assert.equal(saved.progress.exerciseLearning['04.01'].events.some(event => event.id === 'event-help'), false);
    assert.equal(saved.progress.exerciseLearning['04.01'].verifiedEvidence.assessmentVersion, 2);
    assert.equal(saved.progress.exerciseLearning['04.01'].events[0].attemptId, 'attempt-1');
    assert.deepEqual(saved.progress.completed, ['04.01']);
    assert.equal(saved.progress.answers['04.01'], true);
    assert.equal(saved.progress.exerciseDrafts['04.01'], 'preserved');
    assert.equal(saved.progress.exerciseReflections['04.01'], 'reflection stays');
    assert.equal(saved.progress.exerciseEvidence['04.01'].testsPassed, true);
    assert.deepEqual(saved.progress.exerciseEvidence['04.01'].rubric, [0]);
    assert.equal(saved.progress.exerciseEvidence['04.01'].rubricFingerprint, `sha256:${'b'.repeat(64)}`);
  } finally {env.sqlite.close();}
});

test('diagnostic snapshots and attempt eligibility roundtrip through the API sanitizer', async () => {
  const env = setup();
  try {
    const initial = await (await env.route.GET()).json();
    const snapshot = JSON.stringify({v:1,a:['5','unknown'],c:60,r:3});
    const diagnostic = {assistedAttemptIds:['attempt-edit'],submissions:[
      {attemptId:'attempt-clean',revision:2,contentVersion:1,snapshot,mode:'recall',independent:true,assisted:false,
        coverage:{'00.01':true,'01.01':true},recommendations:['01.01'],recordedAt:'2026-10-14T10:00:00.000Z'},
      {attemptId:'attempt-edit',revision:3,contentVersion:1,snapshot,mode:'recall',independent:true,assisted:true,
        coverage:{'00.01':true,'01.01':true},recommendations:[],recordedAt:'2026-10-14T10:01:00.000Z'}
    ]};
    const payload = {...initial.progress,exercisePredictions:{'D.06@v1':snapshot},exerciseEvidence:{'D.06@v1':{
      status:'written',runResult:'guided',output:snapshot,rubric:[],runCount:2,recordedAt:'2026-10-14T10:01:00.000Z',diagnostic
    }}};
    assert.equal((await env.put(payload,initial.revision)).status,200);
    const saved=(await (await env.route.GET()).json()).progress;
    const evidence=saved.exerciseEvidence['D.06@v1'];
    assert.equal(saved.exercisePredictions['D.06@v1'],snapshot);
    assert.deepEqual(evidence.diagnostic.assistedAttemptIds,['attempt-edit']);
    assert.equal(evidence.diagnostic.submissions[0].attemptId,'attempt-clean');
    assert.deepEqual(evidence.diagnostic.submissions[0].recommendations,['01.01']);
    assert.equal(evidence.diagnostic.submissions[1].assisted,true);
    assert.equal(evidence.diagnostic.submissions[1].recommendations.length,0);
  } finally {env.sqlite.close();}
});
