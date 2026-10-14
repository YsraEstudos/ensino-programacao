import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import * as esbuild from 'esbuild-wasm';
import { parse } from 'acorn';
function api() { const w = { TextEncoder }; w.window = w; vm.runInThisContext('(function(window){' + readFileSync('public/module-graph.js', 'utf8') + '})')(w); return w.DevPathModuleGraph; }
function browserHarness() {
    const w = { TextEncoder, crypto: webcrypto, DevPathCompilerAssets: {script: '/compiler-runtime/compiler.js', wasm: '/compiler-runtime/compiler.wasm'} };
    w.window = w;
    let scriptLoads = 0;
    let initCalls = 0;
    let engine;
    let initializeBehavior;
    const document = {
        createElement() { return {}; },
        head: { append(script) {
            scriptLoads++;
            queueMicrotask(() => {
                engine = {
                    parse,
                    async initialize() { initCalls++; await initializeBehavior?.(); },
                    build: esbuild.build,
                    transform: esbuild.transform,
                };
                w.DevPathCompilerEngine = engine;
                script.onload();
            });
        } },
    };
    w.document = document;
    for (const file of ['public/course-case-markers.js', 'public/course-assessment.js', 'public/module-graph.js']) {
        vm.runInThisContext('(function(window){' + readFileSync(file, 'utf8') + '})')(w);
    }
    return {w, get scriptLoads() { return scriptLoads; }, get initCalls() { return initCalls; }, get engine() { return engine; }, setInitializeBehavior(value) { initializeBehavior = value; }};
}
const execute = async (source) => { const logs = [], previous = console.log; console.log = (...v) => logs.push(v.join(' ')); try {
    await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}
finally {
    console.log = previous;
} return logs; };
test('local imports, default exports, reexports, dynamic imports and cycles are bundled', async () => {
    const graph = await api().buildModuleGraph({ entryPath: 'main.js', files: [
            { path: 'main.js', content: 'import value from "./value.js"; import {a} from "./a.js"; console.log(value, a()); console.log((await import("./value.js")).default);' },
            { path: 'value.js', content: 'export {default} from "./actual.js";' },
            { path: 'actual.js', content: 'export default 7;' },
            { path: 'a.js', content: 'import {b} from "./b.js"; export const a = () => b()+1;' },
            { path: 'b.js', content: 'import {a} from "./a.js"; export const b = () => 2; export const again = () => a();' }
        ] }, { build: esbuild.build, parse });
    assert.deepEqual(await execute(graph.code), ['7 3', '7']);
    assert.equal(graph.entryPath, 'main.js');
});
test('external, missing, traversal and computed imports are rejected before execution', async () => {
    for (const content of ['import "https://example.com/x.js"', 'import "./missing.js"', 'import "../escape.js"', 'const path="./x.js"; import(path)']) {
        await assert.rejects(() => api().buildModuleGraph({ entryPath: 'main.js', files: [{ path: 'main.js', content }] }, { build: esbuild.build, parse }));
    }
    await assert.rejects(() => api().buildModuleGraph({ entryPath: 'main.js', files: [{ path: '../main.js', content: '' }] }, { build: esbuild.build, parse }));
});
test('the compiler does not execute the learner code and preserves string export text', async () => {
    const graph = await api().buildModuleGraph({ entryPath: 'main.js', files: [{ path: 'main.js', content: 'console.log("export default inside text"); export default 3;' }] }, { build: esbuild.build, parse });
    assert.deepEqual(await execute(graph.code), ['export default inside text']);
});

test('loaders are selected by extension for TypeScript and JSON modules', async () => {
    const graph = await api().buildModuleGraph({ entryPath: 'main.ts', files: [
        { path: 'main.ts', content: 'import data from "./data.json"; export const answer: number = data.answer;' },
        { path: 'data.json', content: '{"answer": 7}' }
    ] }, { build: esbuild.build, parse });
    assert.match(graph.code, /7/);
});

test('a JavaScript import specifier resolves to a corresponding TypeScript module', async () => {
    const graph = await api().buildModuleGraph({ entryPath: 'main.ts', files: [
        { path: 'main.ts', content: 'import { value } from "./value.js"; export const answer: number = value;' },
        { path: 'value.ts', content: 'export const value: number = 7;' }
    ] }, { build: esbuild.build, parse, transform: esbuild.transform });
    assert.match(graph.code, /7/);
});

test('concurrent marker preparation shares one compiler script load', async () => {
    const harness = browserHarness();
    assert.deepEqual(await Promise.all([harness.w.DevPathCaseMarkers.prepare(), harness.w.DevPathCaseMarkers.prepare()]), [true, true]);
    assert.equal(harness.scriptLoads, 1);
});

test('fingerprinting before module compilation reuses and captures the loaded compiler engine', async () => {
    const harness = browserHarness();
    const assessment = {environment: 'javascript', version: 1, checks: ['behavior'], testPath: 'tests/a.test.js', tests: 'test("x",()=>{/*@case 04.04.x*/ expect(true).toBe(true)});'};
    await harness.w.DevPathAssessment.canonicalFingerprint({activityId: '04.04', files: [], assessment});
    const firstEngine = harness.engine;
    const replacement = {initialize: async () => { throw new Error('replacement engine should not initialize'); }};
    harness.setInitializeBehavior(async () => {
        harness.w.DevPathCompilerEngine = replacement;
    });
    const graph = await harness.w.DevPathModuleGraph.buildModuleGraph({entryPath: 'main.js', files: [{path: 'main.js', content: 'export const value = 7;'}]});
    assert.equal(harness.scriptLoads, 1, 'module graph reuses the parser bundle loaded for fingerprinting');
    assert.equal(harness.initCalls, 1);
    assert.match(graph.code, /value/);
});
