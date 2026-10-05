import {withPublicDependencies} from './public-test-source.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../public/stage01-runner.js', import.meta.url), 'utf8');
const context = { console };
vm.runInNewContext(withPublicDependencies(source), context);
const runner = context.DevPathStage01Runner;
assert.ok(runner);

let result = runner.run(`// inputs\nconst name = "Ada";\nlet count = 2\ncount = count + 1;\nconsole.log(name, count, typeof count);`);
assert.equal(result.ok, true);
assert.deepEqual([...result.values], ['Ada', 3, 'number']);
assert.deepEqual({ ...result.variables }, { name: 'Ada', count: 3 });
assert.deepEqual({ ...result.kinds }, { name: 'const', count: 'let' });
assert.equal(result.lines[0].line, 5);
assert.equal(result.trace.length, 4);

result = runner.run('const n = 2n; console.log(n, typeof n, n + 1n);');
assert.equal(result.ok, true);
assert.deepEqual([...result.values], [2n, 'bigint', 3n]);

result = runner.run('const first = "Ada"; const n = 3; console.log(`Olá, ${first}! ${n + 1}`);');
assert.equal(result.ok, true);
assert.deepEqual([...result.values], ['Olá, Ada! 4']);

result = runner.run('let value = 1; console.log(value); value = 2; console.log(value);');
assert.deepEqual([...result.values], [1, 2]);

result = runner.run('const x = y; console.log("never");');
assert.equal(result.ok, false);
assert.equal(result.lines.length, 0);
assert.match(result.error, /não declarada|TDZ/i);

result = runner.run('const x = 1; console.log(x); const x = 2;');
assert.equal(result.ok, false);
assert.equal(result.lines.length, 0, 'duplicate lexical declarations are parse errors');

result = runner.run('const ativo = true; console.log(ativo);', { ativo: false });
assert.equal(result.ok, true);
assert.deepEqual([...result.values], [false]);

result = runner.run('console.log(1); const true = 2;');
assert.equal(result.ok, false);
assert.equal(result.lines.length, 0);

result = runner.run('const name = "Ada"; console.log(`\\${name} \\`ok\\``);');
assert.equal(result.ok, true);
assert.deepEqual([...result.values], ['${name} `ok`']);

result = runner.run('console.log(1 - 1);');
assert.equal(result.ok, false, 'subtraction is outside Stage 01 grammar');

result = runner.run('const x = 1; console.log(x); x = 2; console.log(x);');
assert.equal(result.ok, false);
assert.deepEqual([...result.values], [1]);
assert.equal(result.lines.length, 1);

result = runner.run('const x = 1 + 2;', { x: 9 });
assert.equal(result.ok, false);
assert.match(result.error, /literal|entrada|inicializador/i);

result = runner.run('const x = 1; console.log(x);', { x: 9 });
assert.equal(result.ok, true);
assert.deepEqual([...result.values], [9]);

result = runner.run('x = 2;');
assert.equal(result.ok, false);
assert.match(result.error, /não declarada/i);

result = runner.run('console.log(window.location);');
assert.equal(result.ok, false);
assert.equal(result.lines.length, 0);

console.log('stage01 runner tests passed');
