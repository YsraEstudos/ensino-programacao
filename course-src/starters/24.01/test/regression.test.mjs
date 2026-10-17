import {afterEach, describe, expect, test} from 'vitest';
import {createAppServer} from '../src/server.mjs';

const active = new Set();
async function start(options) {
  const server = createAppServer(options);
  active.add(server);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  return {server, base: `http://127.0.0.1:${address.port}`};
}
afterEach(async () => {
  await Promise.all([...active].map(server => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('HTTP test server did not close within 5 seconds')), 5000);
    server.closeAllConnections();
    server.close(error => {
      clearTimeout(timer);
      if (error) reject(error);
      else resolve();
    });
  })));
  active.clear();
});
async function login(base, username = 'ana') {
  const response = await fetch(`${base}/api/session`, {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({username, password: `demo-${username}`})});
  return {cookie: response.headers.get('set-cookie').split(';')[0], csrf: (await response.json()).csrf};
}

describe('regressões HTTP', () => {
  test('autentica dono, nega anônimo e nega leitura alheia na API', async () => {
    const {base} = await start();
    expect((await fetch(`${base}/api/private/ana`)).status).toBe(401);
    const {cookie} = await login(base);
    expect((await fetch(`${base}/api/private/ana`, {headers: {cookie}})).status).toBe(200);
    expect((await fetch(`${base}/api/private/bia`, {headers: {cookie}})).status).toBe(403);
  });

  test('nega mutação/logout sem CSRF, encerra sessão e não expõe sentinelas dos corpos nos logs', async () => {
    const logs = [];
    const {base} = await start({logger: value => logs.push(JSON.stringify(value))});
    const {cookie, csrf} = await login(base);
    expect((await fetch(`${base}/api/private/ana`, {method: 'POST', headers: {cookie, 'content-type': 'application/json'}, body: JSON.stringify({text: 'x'})})).status).toBe(403);
    const bodySentinel = 'private-comment-sentinel';
    expect((await fetch(`${base}/api/private/ana`, {method: 'POST', headers: {cookie, 'x-csrf-token': csrf, 'content-type': 'application/json'}, body: JSON.stringify({text: bodySentinel})})).status).toBe(201);
    expect((await fetch(`${base}/api/logout`, {method: 'POST', headers: {cookie}})).status).toBe(403);
    const session = decodeURIComponent(cookie.slice('session='.length));
    expect(logs.join('\n')).not.toContain(session);
    expect(logs.join('\n')).not.toContain(bodySentinel);
    expect((await fetch(`${base}/api/logout`, {method: 'POST', headers: {cookie, 'x-csrf-token': csrf}})).status).toBe(204);
    expect((await fetch(`${base}/api/private/ana`, {headers: {cookie}})).status).toBe(401);
  });

  test('nega cookies fabricados ou IDs previsíveis e não vaza cookie/token sentinela em sucesso ou falha', async () => {
    const logs = [];
    const {base} = await start({logger: value => logs.push(JSON.stringify(value))});
    const guessed = 'session=s-ana';
    expect((await fetch(`${base}/api/private/ana`, {headers: {cookie: guessed}})).status).toBe(401);
    expect((await fetch(`${base}/api/private/ana`, {headers: {cookie: 'session=not-a-session'}})).status).toBe(401);
    const {cookie, csrf} = await login(base);
    expect(cookie).not.toBe(guessed);
    expect(cookie.split('=')[1].split(';')[0].length).toBeGreaterThanOrEqual(40);
    const sentinel = 'denied-token-sentinel-24-01';
    expect((await fetch(`${base}/api/private/ana`, {method: 'POST', headers: {cookie, 'x-csrf-token': csrf, 'content-type': 'application/json'}, body: JSON.stringify({text: 'approved comment'})})).status).toBe(201);
    expect((await fetch(`${base}/api/private/ana`, {method: 'POST', headers: {cookie, 'x-csrf-token': sentinel, 'content-type': 'application/json'}, body: JSON.stringify({text: 'falha'})})).status).toBe(403);
    expect(logs.join('\n')).not.toContain(cookie.split('=')[1].split(';')[0]);
    expect(logs.join('\n')).not.toContain(sentinel);
  });

  test('aceita origem loopback exata da instância, nega outra porta e entrega CSP', async () => {
    const server = createAppServer();
    active.add(server);
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const allowed = await fetch(`${base}/`, {headers: {origin: base}});
    expect(allowed.status).toBe(200);
    expect(allowed.headers.get('access-control-allow-origin')).toBe(base);
    expect(allowed.headers.get('content-security-policy')).toContain("object-src 'none'");
    const denied = await fetch(`${base}/`, {headers: {origin: `${base}:4173`}});
    expect(denied.status).toBe(403);
    expect(denied.headers.get('access-control-allow-origin')).toBeNull();
  });
});
