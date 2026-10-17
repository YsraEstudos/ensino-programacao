import {randomBytes, scryptSync, timingSafeEqual} from 'node:crypto';
// Library primitive: Node crypto scrypt. Demo parameters are bounded, not a production sizing review.
export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString('hex')}`;
}
export function verifyPassword(password, stored) {
  const [, salt, expected] = stored.split('$');
  const actual = scryptSync(password, salt, 64);
  return actual.length === expected.length / 2 && timingSafeEqual(actual, Buffer.from(expected, 'hex'));
}
