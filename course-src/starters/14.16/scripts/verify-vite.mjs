import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
assert.equal(pkg.scripts.dev, 'vite'); assert.equal(pkg.scripts.build, 'vite build'); assert.match(html, /type=\"module\"/);
console.log('Vite project scripts and entry points are declared; run the server and build after installing Vite.');
