import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('postinstall is displayed as untrusted sample data, not executed code', async () => { const sample = JSON.parse(await readFile(new URL('../samples/package-with-postinstall.json', import.meta.url), 'utf8')); assert.equal(sample.scripts.postinstall, 'node install.js'); const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')); assert.equal(pkg.scripts.postinstall, undefined); });
