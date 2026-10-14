import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import vm from 'node:vm';

import { checkTypes } from './typecheck-entry.mjs';

const root = resolve('.');
const tsLibDir = resolve('node_modules/typescript/lib');

function addTree(libraries, directory, prefix) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    const virtual = `${prefix}/${name}`;
    if (statSync(path).isDirectory()) addTree(libraries, path, virtual);
    else if (name.endsWith('.d.ts') || name === 'package.json') libraries[virtual] = readFileSync(path, 'utf8');
  }
}

function installedLibraries({ dom = true, node = true, assertions = false } = {}) {
  const libraries = {};
  for (const name of readdirSync(tsLibDir)) {
    if (!/^lib\..+\.d\.ts$/.test(name)) continue;
    if (!dom && /^lib\.dom(?:\.|\.d)/.test(name)) continue;
    libraries[`/node_modules/typescript/lib/${name}`] = readFileSync(join(tsLibDir, name), 'utf8');
    libraries[`/${name}`] = libraries[`/node_modules/typescript/lib/${name}`];
  }
  if (node) {
    addTree(libraries, resolve('node_modules/@types/node'), '/node_modules/@types/node');
    addTree(libraries, resolve('node_modules/undici-types'), '/node_modules/undici-types');
  }
  if (assertions) {
    libraries['/node_modules/@types/expect-type/index.d.ts'] = `
      type Equal<A, B> =
        (<T>() => T extends A ? 1 : 2) extends
        (<T>() => T extends B ? 1 : 2) ?
        ((<T>() => T extends B ? 1 : 2) extends (<T>() => T extends A ? 1 : 2) ? true : false) : false;
      interface ExpectTypeOf<T> {
        toEqualTypeOf<U>(...args: Equal<T, U> extends true ? [] : ['types differ']): void;
      }
      declare function expectTypeOf<T>(): ExpectTypeOf<T>;
      declare function expectTypeOf<T>(value: T): ExpectTypeOf<T>;
    `;
  }
  return libraries;
}

function run(code, { config = {}, libraries = installedLibraries() } = {}) {
  const files = [
    { path: 'main.ts', content: code },
    { path: 'tsconfig.json', content: JSON.stringify({ compilerOptions: { strict: true, noEmit: true, ...config }, files: ['main.ts'] }) }
  ];
  return checkTypes({ files, entryPaths: ['main.ts'], tsconfigPath: 'tsconfig.json' }, { libraries });
}

function codes(result) {
  return result.diagnostics.map(diagnostic => diagnostic.code);
}

test('reports TS2322 with the virtual file, line and column', () => {
  const result = run('const value: number = "x";');
  const diagnostic = result.diagnostics.find(item => item.code === 2322);
  assert.equal(result.supported, true);
  assert.ok(diagnostic);
  assert.equal(diagnostic.file, 'main.ts');
  assert.equal(diagnostic.line, 1);
  assert.ok(Number.isInteger(diagnostic.column) && diagnostic.column > 0);
});

test('accepts a valid strict TypeScript solution', () => {
  const result = run('const value: number = 1; export { value };');
  assert.equal(result.supported, true);
  assert.deepEqual(result.diagnostics, []);
});

test('resolves a .js import to the corresponding virtual .ts module', () => {
  const result = checkTypes({
    files: [
      { path: 'main.ts', content: 'import { value } from "./value.js"; const answer: number = value;' },
      { path: 'value.ts', content: 'export const value: number = 1;' },
      { path: 'tsconfig.json', content: JSON.stringify({ compilerOptions: { strict: true, noEmit: true, module: 'nodenext', moduleResolution: 'nodenext' }, files: ['main.ts'] }) }
    ],
    entryPaths: ['main.ts'],
    tsconfigPath: 'tsconfig.json'
  }, { libraries: installedLibraries() });
  assert.equal(result.supported, true);
  assert.deepEqual(result.diagnostics, []);
});

test('reports a semantic error from a secondary imported file', () => {
  const result = checkTypes({
    files: [
      { path: 'main.ts', content: 'import { broken } from "./helper.js"; export const value = broken;' },
      { path: 'helper.ts', content: 'export const broken: string = 42;' }
    ],
    entryPaths: ['main.ts']
  }, { libraries: installedLibraries() });
  const diagnostic = result.diagnostics.find(item => item.code === 2322);
  assert.ok(diagnostic);
  assert.equal(diagnostic.file, 'helper.ts');
});

test('accepts a used ts-expect-error and reports an unused directive as TS2578', () => {
  assert.equal(codes(run('// @ts-expect-error\nconst value: number = "x";')).includes(2578), false);
  assert.ok(codes(run('// @ts-expect-error\nconst value: number = 1;')).includes(2578));
});

test('reports a missing requested lib as an unsupported environment', () => {
  const result = run('document.body.textContent = "ok";', { config: { lib: ['es2024', 'dom'] }, libraries: installedLibraries({ dom: false, node: false }) });
  assert.equal(result.supported, false);
  assert.ok(result.diagnostics.some(item => item.code === 6053 || /lib\.dom/i.test(item.message)));
});

test('reports an unknown tsconfig option as unsupported', () => {
  const result = run('const value = 1;', { config: { definitelyNotACompilerOption: true } });
  assert.equal(result.supported, false);
  assert.ok(result.diagnostics.some(item => item.code === 5023 || /unknown|option/i.test(item.message)));
});

test('classifies malformed, invalid and unavailable tsconfig as unsupported', () => {
  const baseFiles = [{ path: 'main.ts', content: 'const value: number = 1;' }];
  const malformed = checkTypes({ files: [...baseFiles, { path: 'tsconfig.json', content: '{"compilerOptions":' }], entryPaths: ['main.ts'], tsconfigPath: 'tsconfig.json' }, { libraries: installedLibraries() });
  const invalidValue = checkTypes({ files: [...baseFiles, { path: 'tsconfig.json', content: JSON.stringify({ compilerOptions: { target: 'not-a-target' }, files: ['main.ts'] }) }], entryPaths: ['main.ts'], tsconfigPath: 'tsconfig.json' }, { libraries: installedLibraries() });
  const unavailableExtends = checkTypes({ files: [...baseFiles, { path: 'tsconfig.json', content: JSON.stringify({ extends: '../outside.json', files: ['main.ts'] }) }], entryPaths: ['main.ts'], tsconfigPath: 'tsconfig.json' }, { libraries: installedLibraries() });
  for (const result of [malformed, invalidValue, unavailableExtends]) {
    assert.equal(result.supported, false);
    assert.ok(result.diagnostics.length > 0);
  }
});

test('applies recursive include and exclude patterns to virtual files', () => {
  const result = checkTypes({
    files: [
      { path: 'src/main.ts', content: 'export const value = 1;' },
      { path: 'src/ignored.ts', content: 'const broken: number = "ignored";' },
      { path: 'src/nested/also-ignored.ts', content: 'const broken: number = "ignored";' },
      { path: 'tsconfig.json', content: JSON.stringify({ include: ['src/**/*.ts'], exclude: ['src/ignored.ts', 'src/nested/**'], compilerOptions: { strict: true, noEmit: true } }) }
    ],
    entryPaths: ['src/main.ts'],
    tsconfigPath: 'tsconfig.json'
  }, { libraries: installedLibraries() });
  assert.equal(result.supported, true);
  assert.deepEqual(result.diagnostics, []);
});

test('rejects duplicate normalized virtual exercise paths', () => {
  assert.throws(() => checkTypes({
    files: [
      { path: 'main.ts', content: 'export const value = 1;' },
      { path: 'src/../main.ts', content: 'export const value = 2;' }
    ],
    entryPaths: ['main.ts']
  }, { libraries: installedLibraries() }), /duplicado/i);
});

test('requires equal types for expectTypeOf assertions without an any escape hatch', () => {
  const equal = run('expectTypeOf<number>().toEqualTypeOf<number>();', { config: { types: ['expect-type'] }, libraries: installedLibraries({ assertions: true }) });
  assert.deepEqual(equal.diagnostics, []);
  const different = run('expectTypeOf<number>().toEqualTypeOf<string>();', { config: { types: ['expect-type'] }, libraries: installedLibraries({ assertions: true }) });
  assert.ok(different.diagnostics.some(item => item.code === 2554));
});

test('resolves installed Node and undici declarations without permissive globals', () => {
  const result = run('import { readFile } from "node:fs"; import type { RequestInit } from "undici-types"; const fn: typeof readFile = readFile; const request: RequestInit = {}; export { fn, request };', { config: { module: 'nodenext', moduleResolution: 'nodenext', types: ['node'] } });
  assert.equal(result.supported, true);
  assert.deepEqual(result.diagnostics, []);
});

test('marks missing Node, undici and assertion declarations as unsupported', () => {
  const nodeMissing = run('const value = 1;', { config: { types: ['node'] }, libraries: installedLibraries({ node: false }) });
  const allLibraries = installedLibraries();
  for (const key of Object.keys(allLibraries)) if (key.includes('/undici-types/')) delete allLibraries[key];
  const undiciMissing = run('import type { RequestInit } from "undici-types"; const request: RequestInit = {}; export { request };', { config: { module: 'nodenext', moduleResolution: 'nodenext' }, libraries: allLibraries });
  const assertionMissing = run('expectTypeOf<number>().toEqualTypeOf<number>();', { config: { types: ['expect-type'] }, libraries: installedLibraries() });
  for (const result of [nodeMissing, undiciMissing, assertionMissing]) {
    assert.equal(result.supported, false);
    assert.ok(result.diagnostics.length > 0);
  }
});

test('does not allow any to mask a mismatched expectTypeOf assertion', () => {
  const result = run('const value: any = 1; expectTypeOf<typeof value>().toEqualTypeOf<string>();', { config: { types: ['expect-type'] }, libraries: installedLibraries({ assertions: true }) });
  assert.equal(result.supported, true);
  assert.ok(result.diagnostics.some(item => item.code === 2554));
});

function loadTypeChecker(workerFactory, fetchImpl = async () => new Response('{}')) {
  const window = {
    DevPathCompilerAssets: { typecheckWorker: '/compiler-runtime/typecheck-worker.js', typecheckLibraries: '/compiler-runtime/typecheck-libraries.json' },
    Worker: workerFactory,
    fetch: fetchImpl,
    setTimeout,
    clearTimeout,
    AbortController,
    Response
  };
  window.window = window;
  vm.runInNewContext(readFileSync('public/course-typechecker.js', 'utf8'), { window, self: window, setTimeout, clearTimeout, AbortController, Response });
  return window.DevPathTypeChecker;
}

test('browser client returns worker results and terminates the worker', async () => {
  const workers = [];
  class FakeWorker {
    constructor(url) { this.url = url; this.listeners = new Map(); this.terminated = false; workers.push(this); }
    addEventListener(name, listener) { this.listeners.set(name, listener); }
    removeEventListener(name) { this.listeners.delete(name); }
    postMessage(message) { queueMicrotask(() => this.listeners.get('message')?.({ data: { token: message.token, result: { kind: 'type-error', supported: true, diagnostics: [{ code: 2322 }], source: 'browser' } } })); }
    terminate() { this.terminated = true; }
  }
  const checker = loadTypeChecker(FakeWorker);
  const result = await checker.check({ files: [], entryPaths: ['main.ts'] });
  assert.equal(result.kind, 'type-error');
  assert.equal(result.text, 'TypeScript encontrou 1 diagnóstico(s).');
  assert.equal(workers.length, 1);
  assert.equal(workers[0].terminated, true);
});

test('browser client terminates on cancellation and ignores late worker messages', async () => {
  let worker;
  class FakeWorker {
    constructor() { worker = this; this.listeners = new Map(); }
    addEventListener(name, listener) { this.listeners.set(name, listener); }
    removeEventListener(name) { this.listeners.delete(name); }
    postMessage() {}
    terminate() { this.terminated = true; }
  }
  const checker = loadTypeChecker(FakeWorker);
  const controller = new AbortController();
  const pending = checker.check({ files: [], entryPaths: ['main.ts'] }, { signal: controller.signal });
  controller.abort();
  const result = await pending;
  assert.equal(result.kind, 'cancelled');
  assert.equal(result.text, 'A verificação TypeScript foi cancelada.');
  assert.equal(worker.terminated, true);
  worker.listeners.get('message')?.({ data: { result: { kind: 'passed' } } });
});

test('browser client times out, aborts library fetch and discards late responses', async () => {
  let worker;
  let fetchSignal;
  class FakeWorker {
    constructor() { worker = this; this.listeners = new Map(); this.terminated = false; }
    addEventListener(name, listener) { this.listeners.set(name, listener); }
    removeEventListener(name) { this.listeners.delete(name); }
    postMessage() {}
    terminate() { this.terminated = true; }
  }
  const checker = loadTypeChecker(FakeWorker, async (_url, options) => {
    fetchSignal = options.signal;
    return new Response('{}');
  });
  const result = await checker.check({ files: [], entryPaths: ['main.ts'] }, { timeoutMs: 5 });
  assert.equal(result.kind, 'timeout');
  assert.equal(result.text, 'A verificação TypeScript excedeu o tempo limite.');
  assert.equal(worker.terminated, true);
  assert.equal(worker.listeners.size, 0);
  assert.equal(fetchSignal.aborted, true);
  worker.listeners.get('message')?.({ data: { result: { kind: 'passed' } } });
});

test('bundled worker runs the virtual host in a browser-like context', () => {
  const workerSource = readFileSync('public/compiler-runtime/typecheck-worker.js', 'utf8');
  const libraries = JSON.parse(readFileSync('public/compiler-runtime/typecheck-libraries.json', 'utf8'));
  const messages = [];
  const workerScope = { postMessage(message) { messages.push(message); } };
  vm.runInNewContext(workerSource, { self: workerScope, console });
  workerScope.onmessage({ data: {
    token: 'browser-host',
    libraries,
    input: {
      files: [
        { path: 'main.ts', content: 'const value: number = 1;' },
        { path: 'tsconfig.json', content: JSON.stringify({ compilerOptions: { strict: true, noEmit: true }, files: ['main.ts'] }) }
      ],
      entryPaths: ['main.ts'],
      tsconfigPath: 'tsconfig.json'
    }
  } });
  assert.equal(messages.length, 1);
  assert.equal(messages[0].token, 'browser-host');
  assert.equal(messages[0].result.kind, 'passed');
  assert.equal(messages[0].result.diagnostics.length, 0);
});
