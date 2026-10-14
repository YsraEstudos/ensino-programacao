import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const config = await readFile(new URL('../eslint.config.js', import.meta.url), 'utf8');
assert.match(pkg.devDependencies.eslint, /^\^9/); assert.ok(pkg.devDependencies.prettier); assert.match(config, /no-unused-vars/);
console.log('ESLint 9 flat config and Prettier are declared; run them after installing dependencies.');
