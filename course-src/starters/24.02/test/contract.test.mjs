import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import {createApplication} from '../src/service.mjs';
import {startNode, startHono} from '../src/server.mjs';
import {parseProject, parseLogin, parsePayment} from '../src/schema.mjs';
import {isPayment} from '../src/schema-bridge.mjs';
import {databaseDirectory, requireClosed} from '../scripts/test-workspace.mjs';

const passwords = {ana: 'Ana-secret-sentinel-907!', bruno: 'Bruno-secret-sentinel-908!'};
const problem = (reply, status) => {
  assert.equal(reply.status, status);
  assert.match(reply.headers.get('content-type'), /^application\/problem\+json/);
  assert.equal(reply.body.status, status);
  assert.equal(reply.body.type, 'about:blank');
  assert.equal(typeof reply.body.title, 'string');
  assert.equal(typeof reply.body.instance, 'string');
  assert.deepEqual(Object.keys(reply.body).sort(), ['instance','status','title','type'], 'generic problems omit SQL, stack and credential fields');
};
async function fixture(t, mode, scenario) {
  const {dbPath} = databaseDirectory(`db-${mode}-${scenario}`);
  const logs = [];
  let time = 1000000;
  const app = createApplication({dbPath, users: passwords, clock: () => time, log: entry => logs.push(entry)});
  let server;
  t.after(async () => {
    if (server) await server.close(); else app.close();
    requireClosed([app.store.db]);
  });
  server = await (mode === 'node' ? startNode : startHono)(app, {port: 0});
  const request = async (method, route, body, token, extra = {}) => {
    const headers = {...(token ? {authorization: `Bearer ${token}`} : {}), ...extra};
    if (body !== undefined && !headers['content-type']) headers['content-type'] = 'application/json';
    const response = await fetch(server.url + route, {method, headers, body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body), signal: AbortSignal.timeout(5000)});
    return {status: response.status, headers: response.headers, body: await response.json()};
  };
  const login = async user => {
    const r = await request('POST', '/sessions', {username: user, password: passwords[user]});
    assert.equal(r.status, 201, 'student must implement successful authentication');
    return r.body.token;
  };
  return {app, server, request, login, dbPath, logs, expire: () => {time += 901000;}};
}

test('22.06 bridge: execute real schema validation, strict keys, bounds and adversarial cases', () => {
  for (const value of [{id: 'p1', amount: 2}, {id: 'p2', amount: 0}, {id: 'p3', amount: -1}]) {
    assert.equal(isPayment(value), true);
    assert.deepEqual(parsePayment(value), value, 'same corpus as manual guard in 22.06');
  }
  for (const value of [null, [], {id: 'p', amount: '1'}, {id: 'p', amount: NaN}, {id: 'p', amount: Infinity}, {id: '', amount: 1}, {id: 'p', amount: 1, admin: true}]) {
    assert.equal(isPayment(value), false);
    assert.throws(() => parsePayment(value), /schema/);
  }
  assert.deepEqual(parseProject({name: 'Pesquisa', tasks: ['Ler']}), {name: 'Pesquisa', tasks: ['Ler']});
  for (const value of [null, [], {}, {name: 4, tasks: []}, {name: 'x', tasks: [], owner_id: 'bruno'}, {name: 'x', tasks: ['']}, {name: 'x'.repeat(81), tasks: []}, {name: 'x', tasks: Array(9).fill('a')}]) {
    assert.throws(() => parseProject(value), /schema/, 'schema must reject an invalid project');
  }
  assert.throws(() => parseLogin({username: '__proto__', password: passwords.ana}), /schema/);
});

for (const mode of ['node', 'hono']) {
  test(`${mode}: shared contract authenticates, authorizes both related resources, persists and revokes`, {timeout: 20000}, async t => {
    const f = await fixture(t, mode, 'auth');
    const a = await f.login('ana'), b = await f.login('bruno'), a2 = await f.login('ana');
    assert.match(a, /^[A-Za-z0-9_-]{43}$/);
    assert.notEqual(a, a2, 'sessions must be independently random');
    problem(await f.request('GET', '/projects'), 401);
    const denied = await f.request('POST', '/sessions', {username: 'ana', password: 'DENIED_SECRET_SENTINEL'});
    problem(denied, 401);
    assert.ok(!JSON.stringify(denied.body).includes('DENIED_SECRET_SENTINEL'));
    for (const secret of [...Object.values(passwords), a, b, a2, 'DENIED_SECRET_SENTINEL']) {
      assert.ok(!JSON.stringify(f.logs).includes(secret), 'success and denial logs omit authentication credentials');
    }
    const created = await f.request('POST', '/projects', {name: "research'); DROP TABLE users;--", tasks: ['first']}, a);
    assert.equal(created.status, 201);
    const id = created.body.id;
    const own = await f.request('GET', `/projects/${id}`, undefined, a);
    assert.equal(own.body.tasks.length, 1);
    assert.equal(own.body.name, "research'); DROP TABLE users;--");
    problem(await f.request('GET', `/projects/${id}`, undefined, b), 404);
    problem(await f.request('POST', `/projects/${id}/tasks`, {title: 'stolen'}, b), 404);
    assert.deepEqual((await f.request('GET', '/projects', undefined, b)).body, []);
    assert.equal((await f.request('POST', `/projects/${id}/tasks`, {title: 'next'}, a)).status, 201);
    const db = new DatabaseSync(f.dbPath);
    try {
      assert.equal(db.prepare('SELECT COUNT(*) n FROM tasks WHERE project_id=?').get(id).n, 2);
      const user = db.prepare('SELECT password_hash FROM users WHERE id=?').get('ana');
      assert.match(user.password_hash, /^scrypt\$/);
      assert.ok(!user.password_hash.includes(passwords.ana));
      const raw = await readFile(f.dbPath);
      assert.ok(!raw.includes(Buffer.from(passwords.ana)));
      assert.equal(db.prepare('SELECT COUNT(*) n FROM schema_migrations').get().n, 2);
      assert.equal(db.prepare('SELECT COUNT(*) n FROM sessions WHERE token_hash=?').get(a).n, 0);
    } finally { db.close(); }
    assert.equal((await f.request('DELETE', '/sessions/current', undefined, a)).status, 200);
    problem(await f.request('GET', '/projects', undefined, a), 401);
    f.expire();
    problem(await f.request('GET', '/projects', undefined, b), 401);
  });
  test(`${mode}: real rollback, schema, RFC9457, parser bounds and logs without secrets`, {timeout: 20000}, async t => {
    const f = await fixture(t, mode, 'errors');
    const token = await f.login('ana');
    const broken = await f.request('POST', '/projects', {name: 'must rollback', tasks: ['duplicate', 'duplicate']}, token);
    problem(broken, 409);
    assert.deepEqual((await f.request('GET', '/projects', undefined, token)).body, [], 'SQL failure must roll back project and first task');
    problem(await f.request('POST', '/projects', {name: 'x', tasks: [], owner: 'bruno'}, token), 400);
    problem(await f.request('POST', '/projects', '{', token), 400);
    problem(await f.request('POST', '/projects', 'x'.repeat(17000), token), 413);
    problem(await f.request('POST', '/projects', '{}', token, {'content-type': 'text/plain'}), 415);
    problem(await f.request('GET', '/projects', undefined, token, {origin: 'https://evil.invalid'}), 403);
    problem(await f.request('GET', '/projects/0', undefined, token), 404);
    problem(await f.request('GET', '/missing?password=URL_SECRET_SENTINEL', undefined, token), 404);
    problem(await f.request('PUT', '/projects', undefined, token), 405);
    const sent = 'BODY_SECRET_SENTINEL';
    assert.equal((await f.request('POST', '/projects', {name: sent, tasks: []}, token)).status, 201);
    const serialized = JSON.stringify(f.logs);
    for (const secret of [...Object.values(passwords), token, sent, 'URL_SECRET_SENTINEL', 'DENIED_SECRET_SENTINEL']) assert.ok(!serialized.includes(secret), 'logs must omit credentials, bodies and query values');
    assert.ok(f.logs.some(x => x.status === 409));
    // A started request must finish before the DB is closed; no timing sleeps.
    let entered, release;
    const started = new Promise(resolve => { entered = resolve; });
    const proceed = new Promise(resolve => { release = resolve; });
    const original = f.app.handle;
    f.app.handle = async request => { entered(); await proceed; return original(request); };
    const pending = f.request('GET', '/projects', undefined, token);
    await started;
    const closing = f.server.close();
    release();
    assert.equal((await pending).status, 200, 'shutdown drains an accepted in-flight request');
    await closing;
    await f.server.close(); // idempotent shutdown
    await assert.rejects(fetch(f.server.url + '/projects', {signal: AbortSignal.timeout(1000)}));
    assert.throws(() => f.app.store.db.prepare('SELECT 1'), /closed|open/i, 'shutdown closes SQLite');
  });
}

test('SQLite persistence survives reopen and versioned migrations do not rerun or destroy user data', async t => {
  const {dbPath} = databaseDirectory('reopen');
  const applications = [];
  t.after(() => {
    for (const application of applications) application.close();
    requireClosed(applications.map(application => application.store.db));
  });
  let app = createApplication({dbPath, users: passwords});
  applications.push(app);
  app.store.db.prepare('INSERT INTO projects(owner_id,name) VALUES (?,?)').run('ana', 'retained');
  app.close();
  requireClosed([app.store.db]);
  app = createApplication({dbPath, users: passwords});
  applications.push(app);
  assert.throws(() => requireClosed([app.store.db]), {code: 'ERR_TEST_DATABASE_OPEN'}, 'live connections must not be reported as closed');
  assert.equal(app.store.db.prepare('SELECT name FROM projects').get().name, 'retained');
  assert.equal(app.store.db.prepare('SELECT COUNT(*) n FROM schema_migrations').get().n, 2);
  assert.equal(app.store.db.prepare('PRAGMA foreign_keys').get().foreign_keys, 1);
  for (const application of applications) application.close();
  requireClosed(applications.map(application => application.store.db));
  assert.ok(applications.every(application => !application.store.db.isOpen));
  // File/directory removal is independently verified by the owning parent,
  // after this SQLite process exits. These native assertions do not claim it.
});
