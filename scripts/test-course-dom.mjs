import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {parse as acornParse} from 'acorn';

function api() {
  const window = {AbortController, DOMException, setTimeout, clearTimeout, crypto: {randomUUID: () => 'task6-token'}};
  window.window = window;
  vm.runInNewContext(readFileSync('public/course-dom-runner.js', 'utf8'), {window});
  return window.DevPathDomRunner;
}

test('DOM runner exposes a browser-only assessment contract and rejects external files', async () => {
  const runner = api();
  assert.equal(typeof runner.run, 'function');
  const result = await runner.run({files: [{path: 'https://evil.test/app.js', content: ''}], entryPath: 'app.js'}, {});
  assert.equal(result.kind, 'error');
  assert.match(result.text, /local|caminho|arquivo/i);
  assert.equal(result.source, 'browser');
});

test('DOM runner reports unsupported outside a real document and does not fake DOM approval', async () => {
  const runner = api();
  const result = await runner.run({files: [{path: 'main.js', content: 'export default 1'}], entryPath: 'main.js'}, {timeoutMs: 50});
  assert.equal(result.kind, 'unsupported');
  assert.match(result.text, /browser|DOM|navegador/i);
});

test('DOM runner validates an entry and keeps the result contract for cancellation', async () => {
  const runner = api();
  const controller = new AbortController();
  controller.abort();
  const result = await runner.run({files: [{path: 'main.js', content: ''}], entryPath: 'main.js'}, {signal: controller.signal});
  assert.equal(result.kind, 'cancelled');
  assert.equal(result.source, 'browser');
});

test('DOM runner keeps interactive form and CSS capabilities inside the opaque frame', () => {
  const source = readFileSync('public/course-dom-runner.js', 'utf8');
  assert.match(source, /allow-scripts allow-forms/);
  assert.match(source, /form-action 'none'/);
  assert.match(source, /style-src 'unsafe-inline'/);
  assert.match(source, /iframe\.title/);
  assert.doesNotMatch(source, /allow-same-origin/);
});

test('DOM runner forwards assertion cases to Worker source bundling', () => {
  const source = readFileSync('public/course-dom-runner.js', 'utf8');
  assert.match(source, /workerSourcesFor\(spec, codeFiles, options\.assertionCases \|\| spec\.assertionCases \|\| \[\]\)/);
  assert.match(source, /bundleWorkerEntries\(\{files: codeFiles, workerEntries: declared, assertionCases\}\)/);
});

test('DOM runner rejects an empty registered suite and unavailable test runtime', () => {
  const source = readFileSync('public/course-dom-runner.js', 'utf8');
  assert.match(source, /tests\.total < 1 \|\| tests\.failed/);
  assert.match(source, /runtime de testes DOM não está disponível/);
});

// Loop guard: the transform is parser-based. The browser uses the acorn parser
// bundled in the local compiler; here the same acorn package is used directly.

const TICK = '__devpathLoopTick';
function domRunnerWithParser() {
  const window = {AbortController, DOMException, setTimeout, clearTimeout, crypto: {randomUUID: () => 'task6-token'}, DevPathCompilerEngine: {parse: acornParse}};
  window.window = window;
  vm.runInNewContext(readFileSync('public/course-dom-runner.js', 'utf8'), {window});
  return window.DevPathDomRunner;
}
// Runs instrumented code in a fresh realm with the guard installed, the same way the frame does.
function runGuarded(runner, code, limitMs = 50) {
  const context = vm.createContext({performance});
  vm.runInContext(`(${runner.installLoopGuard.toString()})(${limitMs});`, context);
  const instrumented = runner.instrumentLoops(code, acornParse);
  return {instrumented, run: () => vm.runInContext(instrumented, context)};
}
const GUARD_MESSAGE = /Laço provavelmente infinito: execução interrompida após \d+ ms\./;

test('loop guard stops while (true) with a clear Portuguese error within the limit', () => {
  const runner = domRunnerWithParser();
  const {run} = runGuarded(runner, 'while (true) {}', 50);
  const started = Date.now();
  assert.throws(run, GUARD_MESSAGE);
  assert.ok(Date.now() - started < 1500, 'guard should fire close to the limit');
});

test('loop guard covers for(;;), do-while, brace-less bodies and for-in/for-of', () => {
  const runner = domRunnerWithParser();
  assert.throws(() => runGuarded(runner, 'for(;;);', 30).run(), GUARD_MESSAGE);
  assert.throws(() => runGuarded(runner, 'do {} while(true)', 30).run(), GUARD_MESSAGE);
  assert.throws(() => runGuarded(runner, 'let n = 0; while (true) n++;', 30).run(), GUARD_MESSAGE);
  assert.throws(() => runGuarded(runner, 'let n = 0; do n++; while (true);', 30).run(), GUARD_MESSAGE);
  assert.throws(() => runGuarded(runner, 'const it = {[Symbol.iterator]() { return {next: () => ({done: false, value: 1})}; }}; for (const x of it) {}', 30).run(), GUARD_MESSAGE);
  assert.throws(() => runGuarded(runner, 'const o = {}; let i = 0; for (const k in {a:1}) { while (true); }', 30).run(), GUARD_MESSAGE);
});

test('loop guard leaves strings, templates, comments and regex literals untouched', () => {
  const runner = domRunnerWithParser();
  const code = [
    'const a = "while (true) {}";',
    "const b = 'for(;;);';",
    'const c = `do {} while(true) ${"for(;;)"}`;',
    '// while (true) {}',
    '/* for (;;) {} */',
    'const d = /while\\(true\\)\\s*\\{\\}/g;',
    'let total = 0; for (let i = 0; i < 3; i++) total += i;',
    'export {a, b, c, d, total};'
  ].join('\n');
  const instrumented = runner.instrumentLoops(code, acornParse);
  assert.equal(instrumented.split(`${TICK}(`).length - 1, 1, 'only the real for loop is instrumented');
  assert.match(instrumented, /const a = "while \(true\) \{\}";/);
  assert.match(instrumented, /const c = `do \{\} while\(true\) \$\{"for\(;;\)"\}`;/);
  assert.match(instrumented, /\/\* for \(;;\) \{\} \*\//);
  assert.ok(instrumented.includes(String.raw`const d = /while\(true\)\s*\{\}/g;`), 'regex literal is unchanged');
});

test('finite loops still produce their results, including labels, continue and brace-less bodies', () => {
  const runner = domRunnerWithParser();
  const finite = [
    'let s = 0; for (let i = 0; i < 5; i++) s += i; s;',
    'let n = 0; outer: for (let i = 0; i < 3; i++) { for (let j = 0; j < 3; j++) { if (j === 1) continue outer; n++; } } n;',
    'let n = 0; for (const x of [1, 2, 3]) if (x === 2) continue; else n += x; n;',
    'let k = 0; do k++; while (k < 4); k;',
    'let c = 0; for (const key in {a: 1, b: 2}) c++; c;'
  ];
  const expected = [10, 3, 4, 4, 2];
  finite.forEach((code, index) => {
    const {run} = runGuarded(runner, code, 1000);
    assert.equal(run(), expected[index], code);
  });
});

test('loop guard reports the instrumentation failure instead of running unguarded code', () => {
  const runner = domRunnerWithParser();
  assert.throws(() => runner.instrumentLoops('while (true) {}', undefined), /analisador local não está disponível/);
  assert.throws(() => runner.instrumentLoops('while (true', acornParse), SyntaxError);
});

test('loop guard limit is short enough to fire before the default DOM timeout', () => {
  const runner = domRunnerWithParser();
  assert.ok(runner.LOOP_GUARD_MS < 2000);
  assert.equal(runner.LOOP_GUARD_TICK, TICK);
  const source = readFileSync('public/course-dom-runner.js', 'utf8');
  assert.match(source, /instrumentLoops\(graph\.code/);
  assert.match(source, /\(\$\{installLoopGuard\}\)\(\$\{LOOP_GUARD_MS\}\);/);
});
