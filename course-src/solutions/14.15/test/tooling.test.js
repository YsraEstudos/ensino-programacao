import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('the project keeps lint and formatting as separate commands', async () => { const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')); assert.equal(pkg.scripts.lint, 'eslint src'); assert.match(pkg.scripts['format:check'], /prettier/); });
