// Execute this function with the Playwright connector against the local public server.
// eslint-disable-next-line @typescript-eslint/no-unused-expressions -- Callback consumed by the Playwright connector.
async (page) => {
    const p = await page.context().newPage();
    try {
        await p.goto('http://127.0.0.1:8017/devpath.html#/catalog');
        await p.waitForFunction(() => window.DevPathModuleGraph && window.DevPathCourseRunner);
        const result = await p.evaluate(async () => {
            const start = performance.now();
            const graph = await DevPathModuleGraph.buildModuleGraph({ entryPath: 'main.js', files: [
                    { path: 'main.js', content: 'import value from "./value.js"; import {a} from "./a.js"; console.log(value,a()); console.log((await import("./value.js")).default);' },
                    { path: 'value.js', content: 'export {default} from "./actual.js";' },
                    { path: 'actual.js', content: 'export default 7;' },
                    { path: 'a.js', content: 'import {b} from "./b.js"; export const a=()=>b()+1;' },
                    { path: 'b.js', content: 'import {a} from "./a.js"; export const b=()=>2; export const again=()=>a();' }
                ] });
            const compileMs = performance.now() - start;
            const run = code => new Promise(resolve => DevPathCourseRunner.run(code, (kind, text) => resolve({ kind, text })));
            const esm = await run({ module: graph.code });
            const network = await run('await fetch("https://example.com")');
            const storage = await run('console.log(localStorage.getItem("devpath-local-preview-v1"))');
            const loop = await run({ module: 'while(true){}; export default 1;' });
            const cancelled = await new Promise(resolve => { const stop = DevPathCourseRunner.run({ module: 'await new Promise(()=>{}); export default 1;' }, (kind, text) => resolve({ kind, text })); setTimeout(stop, 50); });
            const recovered = await run('console.log(42)');
            return { esm, network, storage, loop, cancelled, recovered, compileMs, frames: document.querySelectorAll('iframe').length };
        });
        if (result.esm.kind !== 'result' || result.esm.text !== '7 3\n7' || result.network.kind !== 'error' || result.storage.kind !== 'error' || result.loop.kind !== 'timeout' || result.cancelled.kind !== 'cancelled' || result.recovered.text !== '42' || result.frames !== 0)
            throw Error(JSON.stringify(result));
        return result;
    }
    finally {
        await p.close();
    }
};
