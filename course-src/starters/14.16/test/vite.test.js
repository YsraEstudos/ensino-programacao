import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('Vite has a module entry and a distinct production build command', async () => { const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')); assert.equal(pkg.scripts.dev, 'vite'); assert.equal(pkg.scripts.build, 'vite build'); });
