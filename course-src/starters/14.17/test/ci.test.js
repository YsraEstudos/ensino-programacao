import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('CI includes reproducible setup and all three independent gates', async () => { const workflow = await readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8'); for (const line of ['node-version: 24', 'npm ci', 'npm run lint', 'npm run typecheck', 'npm test', 'pull_request']) assert.ok(workflow.includes(line), `missing ${line}`); });
