import {expect, test} from 'vitest';
import {pathToFileURL} from 'node:url';
const mutantUrl = process.env.PHASE7_MUTANT ? pathToFileURL(process.env.PHASE7_MUTANT).href : new URL('../src/security.mjs', import.meta.url).href;
const mutant = await import(mutantUrl);

test('mutante respeita autorização, expiração, CSRF e redação', () => {
  if (mutant.canRead) expect(mutant.canRead('ana', 'bia')).toBe(false);
  if (mutant.isExpired) expect(mutant.isExpired(100, 100)).toBe(true);
  if (mutant.canWrite) expect(mutant.canWrite(true, '')).toBe(false);
  if (mutant.redact) expect(mutant.redact({cookie: 'secret'})).toEqual({cookie: '[REDACTED]'});
});
