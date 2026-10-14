import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const page = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const server = await readFile(new URL('../src/server.mjs', import.meta.url), 'utf8');
test('the lesson declares repeatable Network observations', () => {
  assert.match(page, /Resposta 200/); assert.match(page, /Resposta 404/); assert.match(page, /Teste CORS/);
  assert.ok(server.includes("request.url === '/api/items'"));
  assert.ok(server.includes("request.url === '/api/slow'"));
  assert.ok(server.includes('response.statusCode = 404'));
  assert.ok(!server.includes('access-control-allow-origin'));
});
