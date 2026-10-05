import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import * as esbuild from 'esbuild-wasm';
import { parse } from 'acorn';
function api() { const w = { TextEncoder }; w.window = w; vm.runInThisContext('(function(window){' + readFileSync('public/module-graph.js', 'utf8') + '})')(w); return w.DevPathModuleGraph; }
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
