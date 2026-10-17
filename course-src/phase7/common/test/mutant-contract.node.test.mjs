import assert from 'node:assert/strict';
import {test} from 'node:test';
import {pathToFileURL} from 'node:url';

const mutant = await import(pathToFileURL(process.env.PHASE7_MUTANT).href);

test('mutant violates its behavior contract', () => {
  if (mutant.canRead) assert.equal(mutant.canRead('ana', 'bia'), false);
  if (mutant.isExpired) assert.equal(mutant.isExpired(100, 100), true);
  if (mutant.canWrite) assert.equal(mutant.canWrite(true, ''), false);
  if (mutant.redact) assert.deepEqual(mutant.redact({cookie: 'secret'}), {cookie: '[REDACTED]'});
});
