import {describe, expect, test} from 'vitest';
import {createSecurity, redactLogFields, securityHeaders} from '../src/security.mjs';
import {resolveServerConfig} from '../src/server.mjs';

describe('segurança da fixture', () => {
  test('usuário só lê seu recurso e sessão expirada ou encerrada é recusada', () => {
    let now = 1000;
    const auth = createSecurity({now: () => now, ttlMs: 50});
    const sessionId = auth.login('ana', 'demo-ana');
    expect(sessionId).toMatch(/^[A-Za-z0-9_-]{40,}$/);
    expect(auth.canRead(sessionId, 'ana')).toBe(true);
    expect(auth.canRead(sessionId, 'bia')).toBe(false);
    now = 1050;
    expect(auth.userFor(sessionId)).toBeNull();
    const newSessionId = auth.login('ana', 'demo-ana');
    const csrf = auth.csrfFor(newSessionId);
    expect(auth.logout(newSessionId, csrf)).toBe(true);
    expect(auth.userFor(newSessionId)).toBeNull();
  });

  test('mutação exige token CSRF e cabeçalhos declaram CSP', () => {
    const auth = createSecurity();
    const sessionId = auth.login('ana', 'demo-ana');
    const csrf = auth.csrfFor(sessionId);
    expect(auth.canWrite(sessionId, 'ana', 'wrong')).toBe(false);
    expect(auth.canWrite(sessionId, 'ana', csrf)).toBe(true);
    expect(auth.canLogout(sessionId, 'wrong')).toBe(false);
    expect(auth.canLogout(sessionId, csrf)).toBe(true);
    for (const username of ['toString', 'constructor', '__proto__', '']) {
      expect(() => auth.login(username, 'demo-ana')).not.toThrow();
      expect(auth.login(username, 'demo-ana')).toBeNull();
    }
    expect(securityHeaders()['content-security-policy']).toContain("script-src 'self'");
  });

  test('redação remove segredos até em objetos aninhados', () => {
    expect(redactLogFields({cookie: 'demo-session-secret', child: {authorization: 'Bearer demo'}})).toEqual({
      cookie: '[REDACTED]', child: {authorization: '[REDACTED]'},
    });
  });

  test('PORT inválida é rejeitada e o servidor permanece vinculado a loopback', () => {
    expect(resolveServerConfig({PORT: '0'})).toEqual({host: '127.0.0.1', port: 0});
    for (const PORT of ['-1', '65536', '3.5', '80; whoami']) expect(() => resolveServerConfig({PORT})).toThrow(/PORT/);
  });
});
