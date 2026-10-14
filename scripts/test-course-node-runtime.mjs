import assert from 'node:assert/strict';
import nativeAssert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import {existsSync, readFileSync} from 'node:fs';
import {mkdtemp, writeFile, mkdir, rm, symlink, readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {checkLocalProject} from './check-local-course.mjs';
import {setup} from './course-runner-harness.mjs';
import * as esbuild from 'esbuild-wasm';
import {parse} from 'acorn';

function loadRuntime() {
  const window = {TextEncoder, URL, URLSearchParams, structuredClone};
  window.window = window;
  Object.assign(window, {setTimeout, clearTimeout, setImmediate, clearImmediate});
  vm.runInNewContext(readFileSync('public/course-node-runtime.js', 'utf8'), window);
  return window.DevPathNodeRuntime;
}


function clock() {
  let now = 0;
  let next = 1;
  const timers = new Map();
  return {
    now: () => now,
    setTimeout(fn, delay = 0) { const id = next++; timers.set(id, {at: now + delay, fn}); return id; },
    clearTimeout(id) { timers.delete(id); },
    advance(ms) {
      const end = now + ms;
      while (true) {
        const due = [...timers.entries()].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) break;
        timers.delete(due[0]); now = due[1].at; due[1].fn();
      }
      now = end;
    },
    pending: () => timers.size,
  };
}

test('virtual node runtime reads, writes and reports ENOENT inside its root', async () => {
  const runtime = loadRuntime().createNodeRuntime({files: [{path: 'data/config.json', content: '{"port":7}'}], argv: ['node', 'main.js', '--watch'], env: {PORT: '7'}});
  assert.equal(await runtime.modules['node:fs/promises'].readFile('data/config.json', 'utf8'), '{"port":7}');
  await runtime.modules['node:fs/promises'].writeFile('data/out.txt', 'ok');
  assert.equal(await runtime.modules['node:fs/promises'].readFile('data/out.txt', 'utf8'), 'ok');
  await assert.rejects(() => runtime.modules['node:fs/promises'].readFile('missing.txt'), error => error?.code === 'ENOENT');
  await assert.rejects(() => runtime.modules['node:fs/promises'].writeFile('../escape.txt', 'bad'), /raiz|root|escape/i);
});

test('argv, env, output and reset are isolated between executions', async () => {
  const c = clock();
  const runtime = loadRuntime().createNodeRuntime({files: [{path: 'state.txt', content: 'before'}], argv: ['sim-node', 'main.js'], env: {TOKEN: 'secret'}, clock: c});
  runtime.process.stdout.write('hello');
  runtime.process.stderr.write('warn');
  runtime.process.exitCode = 4;
  assert.deepEqual(runtime.process.argv, ['sim-node', 'main.js']);
  assert.equal(runtime.process.env.TOKEN, 'secret');
  await runtime.modules['node:fs/promises'].writeFile('state.txt', 'after');
  runtime.reset();
  assert.equal(await runtime.modules['node:fs/promises'].readFile('state.txt', 'utf8'), 'before');
  assert.equal(runtime.process.stdoutText, '');
  assert.equal(runtime.process.stderrText, '');
  assert.equal(runtime.process.exitCode, 0);
  assert.equal(runtime.process.env.TOKEN, 'secret');
  assert.equal(c.pending(), 0);
});

test('only declared virtual node modules are available and path URLs resolve virtually', async () => {
  const api = loadRuntime();
  const runtime = api.createNodeRuntime({files: [{path: 'data/config.json', content: 'ok'}]});
  assert.ok(runtime.modules['node:path']);
  assert.ok(runtime.modules['node:url']);
  assert.ok(runtime.modules['node:test']);
  assert.ok(runtime.modules['node:assert/strict']);
  assert.equal(runtime.modules['node:path'].dirname('data/config.json'), 'data');
  const url = runtime.modules['node:url'].pathToFileURL('data/config.json');
  assert.equal(runtime.modules['node:url'].fileURLToPath(url), 'data/config.json');
  assert.equal(await runtime.readFileUrl(new URL('./config.json', url.replace(/config\.json$/, 'main.js'))), 'ok');
  assert.throws(() => runtime.module('node:child_process'), /unsupported|suport/i);
});

test('strict assertion subset preserves error classes, RegExp matching, undefined and NaN', async () => {
  const runtime = loadRuntime().createNodeRuntime();
  const assertModule = runtime.modules['node:assert/strict'];
  const outcome = fn => { try { fn(); return true; } catch { return false; } };
  const syncCases = [
    ['strict equality does not coerce', () => assertModule.equal(1, '1'), () => nativeAssert.equal(1, '1')],
    ['array and array-like values differ', () => assertModule.deepStrictEqual([1], {0: 1, length: 1}), () => nativeAssert.deepStrictEqual([1], {0: 1, length: 1})],
    ['prototype differences are significant', () => assertModule.deepStrictEqual(Object.create(null), {}), () => nativeAssert.deepStrictEqual(Object.create(null), {})],
    ['error own code is matched', () => assertModule.throws(() => { const error = new Error('bad'); error.code = 'ENOENT'; throw error; }, {code: 'EACCES'}), () => nativeAssert.throws(() => { const error = new Error('bad'); error.code = 'ENOENT'; throw error; }, {code: 'EACCES'})],
    ['matching error code passes', () => assertModule.throws(() => { const error = new Error('bad'); error.code = 'ENOENT'; throw error; }, {code: 'ENOENT'}), () => nativeAssert.throws(() => { const error = new Error('bad'); error.code = 'ENOENT'; throw error; }, {code: 'ENOENT'})],
  ];
  for (const [label, virtualCase, nativeCase] of syncCases) assert.equal(outcome(virtualCase), outcome(nativeCase), label);
  assertModule.throws(() => { throw new RangeError('bad 19,90'); }, RangeError);
  assertModule.match('bad 19,90', /19,90/);
  assertModule.deepStrictEqual({value: NaN, missing: undefined}, {value: NaN, missing: undefined});
  await assertModule.rejects(Promise.reject(new RangeError('bad')), RangeError);
  await assert.rejects(() => assertModule.rejects(Promise.reject(Object.assign(new Error('bad'), {code: 'ENOENT'})), {code: 'EACCES'}));
  const asyncOutcome = async fn => { try { await fn(); return true; } catch { return false; } };
  const errorCases = [
    ['throws matches an Error instance', () => assertModule.throws(() => { throw new Error('bad'); }, new Error('bad')), () => nativeAssert.throws(() => { throw new Error('bad'); }, new Error('bad'))],
    ['throws rejects a different Error message', () => assertModule.throws(() => { throw new Error('different'); }, new Error('bad')), () => nativeAssert.throws(() => { throw new Error('different'); }, new Error('bad'))],
    ['throws matches custom Error properties', () => assertModule.throws(() => { const error = new Error('bad', {cause: 'root'}); error.code = 'ENOENT'; throw error; }, Object.assign(new Error('bad', {cause: 'root'}), {code: 'ENOENT'})), () => nativeAssert.throws(() => { const error = new Error('bad', {cause: 'root'}); error.code = 'ENOENT'; throw error; }, Object.assign(new Error('bad', {cause: 'root'}), {code: 'ENOENT'}))],
    ['throws matches a nested Error cause', () => assertModule.throws(() => { throw new Error('bad', {cause: new Error('root')}); }, new Error('bad', {cause: new Error('root')})), () => nativeAssert.throws(() => { throw new Error('bad', {cause: new Error('root')}); }, new Error('bad', {cause: new Error('root')}))],
    ['throws rejects a different nested Error message', () => assertModule.throws(() => { throw new Error('different', {cause: new Error('root')}); }, new Error('bad', {cause: new Error('root')})), () => nativeAssert.throws(() => { throw new Error('different', {cause: new Error('root')}); }, new Error('bad', {cause: new Error('root')}))],
  ];
  for (const [label, virtualCase, nativeCase] of errorCases) assert.equal(outcome(virtualCase), outcome(nativeCase), label);
  assert.equal(await asyncOutcome(() => assertModule.rejects(Promise.reject(new Error('bad')), new Error('bad'))), await asyncOutcome(() => nativeAssert.rejects(Promise.reject(new Error('bad')), new Error('bad'))), 'rejects matches an Error instance');
  assert.equal(await asyncOutcome(() => assertModule.rejects(Promise.reject(new Error('different')), new Error('bad'))), await asyncOutcome(() => nativeAssert.rejects(Promise.reject(new Error('different')), new Error('bad'))), 'rejects rejects a different Error message');
  assert.equal(await asyncOutcome(() => assertModule.rejects(Promise.reject(new Error('bad', {cause: new Error('root')})), new Error('bad', {cause: new Error('root')}))), await asyncOutcome(() => nativeAssert.rejects(Promise.reject(new Error('bad', {cause: new Error('root')})), new Error('bad', {cause: new Error('root')}))), 'rejects matches a nested Error cause');
  assert.equal(await asyncOutcome(() => assertModule.rejects(Promise.reject(new Error('different', {cause: new Error('root')})), new Error('bad', {cause: new Error('root')}))), await asyncOutcome(() => nativeAssert.rejects(Promise.reject(new Error('different', {cause: new Error('root')})), new Error('bad', {cause: new Error('root')}))), 'rejects rejects a different nested Error message');
});

test('virtual URLs preserve spaces and a declared virtual cwd without host filesystem access', async () => {
  const runtime = loadRuntime().createNodeRuntime({virtualCwd: 'workspace with spaces', files: [{path: 'data/config.json', content: 'ok'}]});
  const main = runtime.virtualUrl('main.js');
  const data = new URL('./data/config.json', main);
  assert.equal(data.protocol, 'virtual:');
  assert.equal(runtime.modules['node:url'].fileURLToPath(data), 'workspace with spaces/data/config.json');
  assert.equal(await runtime.readFileUrl(data), 'ok');
});

test('serialized factory does not depend on the host Node module loader', async () => {
  const api = loadRuntime();
  const frame = {URL, TextEncoder, TextDecoder, setTimeout, clearTimeout, structuredClone};
  frame.globalThis = frame;
  const factory = vm.runInNewContext(`(${api.source})`, frame);
  const runtime = factory({files: [{path: 'main.js', content: 'ok'}]});
  assert.equal(await runtime.modules['node:fs/promises'].readFile('main.js', 'utf8'), 'ok');
  assert.throws(() => runtime.module('node:fs'), /unsupported|suport/i);
});

test('browser worker executes a node-simulated virtual filesystem and process fixture', async () => {
  const harness = setup();
  try {
    harness.w.eval(readFileSync('public/course-node-runtime.js', 'utf8'));
    new Function('window', readFileSync('public/module-graph.js', 'utf8'))(harness.w);
    const files = [
      {path: 'main.js', content: 'import {readFile} from "node:fs/promises"; import test from "node:test"; import assert from "node:assert/strict"; test("virtual", async () => { const text = await readFile(new URL("./data/config.json", import.meta.url), "utf8"); assert.equal(JSON.parse(text).value, "ok"); assert.equal(process.env.MODE, "fixture"); assert.throws(() => { throw new Error("bad"); }, new Error("bad")); assert.throws(() => assert.throws(() => { throw new Error("different"); }, new Error("bad"))); await assert.rejects(Promise.reject(new Error("bad")), new Error("bad")); assert.throws(() => { throw new Error("bad", {cause: new Error("root")}); }, new Error("bad", {cause: new Error("root")})); assert.throws(() => assert.throws(() => { throw new Error("different", {cause: new Error("root")}); }, new Error("bad", {cause: new Error("root")}))); await assert.rejects(Promise.reject(new Error("bad", {cause: new Error("root")})), new Error("bad", {cause: new Error("root")})); process.stdout.write(process.argv[2]); });'},
      {path: 'data/config.json', content: '{"value":"ok"}'},
    ];
    const graph = await harness.w.DevPathModuleGraph.buildModuleGraph({files, entryPath: 'main.js', runtime: 'node-simulated'}, {build: esbuild.build, parse});
    const result = await harness.run({module: graph.code, nodeRuntime: {files, argv: ['node-simulated', 'main.js', 'argv-ok'], env: {MODE: 'fixture'}}});
    assert.equal(result.kind, 'result');
    assert.ok(result.tests, result.text);
    assert.equal(result.tests.failed, 0, result.text);
    assert.match(result.text, /argv-ok/);
  } finally {
    harness.close();
  }
});


test('local checker returns nonzero, missing executable and timeout without using a shell', async () => {
  const root = await mkdtemp(join(tmpdir(), 'devpath-check-'));
  try {
    await mkdir(join(root, 'project'));
    await writeFile(join(root, 'project', 'ok.js'), 'console.log("ok")');
    const failed = await checkLocalProject({referenceDir: 'project', rootDir: root, commands: [[process.execPath, '-e', 'process.exit(3)']]});
    assert.equal(failed.exitCode, 3);
    const absent = await checkLocalProject({referenceDir: 'project', rootDir: root, commands: [['devpath-command-does-not-exist']]});
    assert.equal(absent.exitCode, null);
    assert.match(absent.output, /ENOENT|not found|não encontrado/i);
    const timed = await checkLocalProject({referenceDir: 'project', rootDir: root, commands: [[process.execPath, '-e', 'setTimeout(()=>{}, 10000)']], timeoutMs: 40});
    assert.equal(timed.timedOut, true);
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});

test('local checker rejects traversal and symlinked project files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'devpath-check-'));
  try {
    await mkdir(join(root, 'project'));
    await writeFile(join(root, 'outside.txt'), 'private');
    await assert.rejects(() => checkLocalProject({referenceDir: '../outside.txt', rootDir: root, commands: [[process.execPath, '-e', '1']] }), /path|caminho|root|raiz/i);
    try {
      await symlink(join(root, 'outside.txt'), join(root, 'project', 'link.txt'));
      await assert.rejects(() => checkLocalProject({referenceDir: 'project', rootDir: root, commands: [[process.execPath, '-e', '1']] }), /symlink|link|fora|outside/i);
    } catch (error) {
      if (error?.code !== 'EPERM' && error?.code !== 'EACCES') throw error;
    }
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});

test('local checker cleans its temporary copy when project validation throws', async () => {
  const root = await mkdtemp(join(tmpdir(), 'devpath-check-'));
  const before = (await readdir(tmpdir())).filter(name => name.startsWith('devpath-course-')).sort();
  try {
    await assert.rejects(() => checkLocalProject({referenceDir: 'missing-project', rootDir: root, commands: [[process.execPath, '-e', '1']]}), /ENOENT|no such file|não encontrado/i);
    const after = (await readdir(tmpdir())).filter(name => name.startsWith('devpath-course-')).sort();
    assert.deepEqual(after, before);
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});

test('local checker bounds output, keeps metacharacters literal, and cleans temp copies after timeout', async () => {
  const root = await mkdtemp(join(tmpdir(), 'devpath-check-'));
  const marker = join(root, 'marker.txt');
  try {
    await mkdir(join(root, 'project'));
    await writeFile(join(root, 'project', 'ok.js'), 'console.log("ok")');
    const literal = await checkLocalProject({referenceDir: 'project', rootDir: root, commands: [[process.execPath, '-e', `require('node:fs').writeFileSync(${JSON.stringify(marker)}, process.argv[1])`, 'a&b|c'] ]});
    assert.equal(literal.exitCode, 0);
    assert.equal(readFileSync(marker, 'utf8'), 'a&b|c');
    const bounded = await checkLocalProject({referenceDir: 'project', rootDir: root, commands: [[process.execPath, '-e', 'process.stdout.write("x".repeat(500000))']]});
    assert.equal(bounded.exitCode, 0);
    assert.ok(bounded.output.length <= 121000);
    const timed = await checkLocalProject({referenceDir: 'project', rootDir: root, commands: [[process.execPath, '-e', `require('node:fs').writeFileSync(${JSON.stringify(marker)}, process.cwd()); setTimeout(()=>{}, 10000)`]], timeoutMs: 50});
    assert.equal(timed.timedOut, true);
    const copiedDirectory = readFileSync(marker, 'utf8');
    assert.equal(existsSync(copiedDirectory), false, `temporary copy remained: ${copiedDirectory}`);
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});

test('local checker kills a timed out descendant and reports missing project dependencies', async () => {
  const root = await mkdtemp(join(tmpdir(), 'devpath-check-'));
  const marker = join(root, 'descendant-marker.txt');
  try {
    await mkdir(join(root, 'project'));
    await writeFile(join(root, 'project', 'missing.js'), 'import "package-that-is-not-installed";');
    const missing = await checkLocalProject({referenceDir: 'project', rootDir: root, commands: [[process.execPath, 'missing.js']]});
    assert.notEqual(missing.exitCode, 0);
    assert.match(missing.output, /package-that-is-not-installed|module not found|cannot find package/i);
    const childCode = `require('node:child_process').spawn(${JSON.stringify(process.execPath)}, ['-e', ${JSON.stringify(`setTimeout(()=>require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'alive'), 1500)`) }], {stdio:'ignore'}); setTimeout(()=>{}, 10000)`;
    const timed = await checkLocalProject({referenceDir: 'project', rootDir: root, commands: [[process.execPath, '-e', childCode]], timeoutMs: 80});
    assert.equal(timed.timedOut, true);
    await new Promise(resolve => setTimeout(resolve, 1800));
    assert.equal(existsSync(marker), false);
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});
