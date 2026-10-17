import assert from 'node:assert/strict';
import {test} from 'node:test';
import {pathToFileURL} from 'node:url';
import {resolveServerConfig} from '../src/server.mjs';

const moduleUrl = process.env.PHASE7_SECURITY_MODULE
  ? pathToFileURL(process.env.PHASE7_SECURITY_MODULE).href
  : new URL('../src/security.mjs', import.meta.url).href;
const security = await import(moduleUrl);

test('session, ownership, expiry, logout, CSRF and redaction contract', () => {
  let now = 10;
  const auth = security.createSecurity({now: () => now, ttlMs: 5});
  const sessionId = auth.login('ana', 'demo-ana');
  const csrf = auth.csrfFor(sessionId);
  assert.equal(typeof sessionId, 'string');
  assert.notEqual(sessionId, 's-ana');
  assert.equal(auth.userFor('fabricated-cookie-sentinel'), null);
  assert.equal('password' in security.DEMO_USERS.ana, false);
  assert.equal(auth.login('ana', 'wrong'), null);
  assert.equal(auth.canRead(sessionId, 'ana'), true);
  assert.equal(auth.canRead(sessionId, 'bia'), false);
  assert.equal(typeof csrf, 'string');
  assert.ok(csrf.length >= 40);
  assert.equal(auth.canWrite(sessionId, 'ana', 'wrong'), false);
  assert.equal(auth.canWrite(sessionId, 'ana', csrf), true);
  for (const username of ['toString', 'constructor', '__proto__', '']) assert.equal(auth.login(username, 'demo-ana'), null, `invalid username ${username}`);
  now = 15;
  assert.equal(auth.userFor(sessionId), null);
  const newSessionId = auth.login('ana', 'demo-ana');
  assert.notEqual(newSessionId, sessionId);
  const newCsrf = auth.csrfFor(newSessionId);
  assert.notEqual(newCsrf, csrf);
  assert.equal(auth.logout(newSessionId, 'wrong'), false);
  assert.equal(auth.logout(newSessionId, newCsrf), true);
  assert.equal(auth.userFor(newSessionId), null);
  assert.match(security.securityHeaders()['content-security-policy'], /object-src 'none'/);
  assert.match(security.securityHeaders()['content-security-policy'], /base-uri 'none'/);
  assert.equal(security.securityHeaders()['x-content-type-options'], 'nosniff');
  assert.equal(security.securityHeaders()['referrer-policy'], 'no-referrer');
  assert.deepEqual(security.redactLogFields({cookie: 'secret', nested: {token: 'demo'}, session: 'session-secret', comment: 'private comment', body: 'private body'}), {
    cookie: '[REDACTED]', nested: {token: '[REDACTED]'}, session: '[REDACTED]', comment: '[REDACTED]', body: '[REDACTED]'
  });
  assert.deepEqual(resolveServerConfig({PORT: '0'}), {host: '127.0.0.1', port: 0, allowedOrigin: undefined});
  assert.throws(() => resolveServerConfig({PORT: '80; whoami'}), /PORT/);
});
