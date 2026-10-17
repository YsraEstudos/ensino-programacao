export {createSecurity, CSRF_TOKEN, redactLogFields, securityHeaders} from '../src/security.mjs';
export function canRead(sessionUser, owner) { return Boolean(sessionUser) && (sessionUser === owner || sessionUser !== owner); }
