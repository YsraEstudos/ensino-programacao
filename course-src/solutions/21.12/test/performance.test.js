import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('scenario exposes repeatable User Timing marks and bounded work', async () => { const source = await readFile(new URL('../src/app.js', import.meta.url), 'utf8'); assert.match(source, /scenario:start/); assert.match(source, /scenario:end/); assert.match(source, /performance.measure/); assert.match(source, /2_000_000/); });
