import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
assert.equal(pkg.scripts.test, 'vitest run');
assert.equal(pkg.scripts['test:watch'], 'vitest');
assert.ok(pkg.devDependencies.vitest, 'install Vitest as a dev dependency');
console.log('Vitest scripts and dependency are declared; this check does not install or run Vitest.');
