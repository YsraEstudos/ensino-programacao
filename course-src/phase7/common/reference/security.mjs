import {randomBytes, scryptSync, timingSafeEqual} from 'node:crypto';

export const DEMO_USERS = Object.freeze({
  ana: {id: 'ana', salt: 'phase7-demo-ana', passwordHash: 'a9db6f69130711c663ba56a1d4ed63d6e5cf2f65161728e716c698dd8b2af0ae'},
  bia: {id: 'bia', salt: 'phase7-demo-bia', passwordHash: 'b2c30164664638d403c061b29ef0c832701b1146756dd40776de5d9ef3889c75'},
});
export const SESSION_TTL_MS = 5 * 60_000;

export function createSecurity({now = () => Date.now(), users = DEMO_USERS, ttlMs = SESSION_TTL_MS} = {}) {
  const sessions = new Map();
  return Object.freeze({
    login(username, password) {
      if (typeof username !== 'string' || !/^[a-z]{1,32}$/.test(username) || !Object.hasOwn(users, username)) return null;
      const user = users[username];
      if (!user || typeof user.passwordHash !== 'string' || !/^[a-f0-9]+$/i.test(user.passwordHash) || typeof password !== 'string') return null;
      const expected = Buffer.from(user.passwordHash, 'hex');
      const supplied = scryptSync(password, user.salt, expected.length);
      if (!timingSafeEqual(expected, supplied)) return null;
      const sessionId = randomBytes(32).toString('base64url');
      const csrfToken = randomBytes(32).toString('base64url');
      sessions.set(sessionId, {userId: user.id, csrfToken, expiresAt: now() + ttlMs});
      return sessionId;
    },
    csrfFor(sessionId) { return this.userFor(sessionId) ? sessions.get(sessionId).csrfToken : null; },
    logout(sessionId, csrf) {
      if (!this.canLogout(sessionId, csrf)) return false;
      return sessions.delete(sessionId);
    },
    canLogout(sessionId, csrf) {
      const session = sessions.get(sessionId);
      return Boolean(this.userFor(sessionId) && session && typeof csrf === 'string' && csrf === session.csrfToken);
    },
    userFor(sessionId) {
      const session = sessions.get(sessionId);
      if (!session) return null;
      if (session.expiresAt <= now()) { sessions.delete(sessionId); return null; }
      return session.userId;
    },
    canRead(sessionId, ownerId) { return this.userFor(sessionId) === ownerId; },
    canWrite(sessionId, ownerId, csrf) {
      const session = sessions.get(sessionId);
      return this.canRead(sessionId, ownerId) && Boolean(session && typeof csrf === 'string' && csrf === session.csrfToken);
    },
  });
}

export function securityHeaders() {
  return {
    'content-security-policy': "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
  };
}

export function redactLogFields(value) {
  if (Array.isArray(value)) return value.map(redactLogFields);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key,
      /password|authorization|cookie|token|secret|session|comment|body/i.test(key) ? '[REDACTED]' : redactLogFields(item),
    ]));
  }
  return value;
}
