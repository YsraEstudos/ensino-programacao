import { readFileSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { DatabaseSync } from 'node:sqlite';
import { gzipSync } from 'node:zlib';
import { loadTsModule } from './load-ts-module.mjs';
const { sanitizeUserProgress } = loadTsModule('lib/progress-sanitize.ts');
const { createEmptyProgress } = loadTsModule('lib/progress-model.ts');
const catalog = JSON.parse(readFileSync('public/course-catalog.json', 'utf8'));
const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE progress (id INTEGER PRIMARY KEY, data TEXT)');
const progress = [];
for (const count of [...new Set([10, Math.ceil(catalog.length / 2), catalog.length])].sort((a, b) => a - b)) {
    const source = createEmptyProgress();
    for (const item of catalog.slice(0, count)) {
        source.exerciseDrafts[item.id] = 'const tentativa = "dados sintéticos";\n'.repeat(20);
        source.exerciseReflections[item.id] = 'Explicação sintética do resultado e dos critérios.';
        source.attempts[item.id] = 3;
        source.answers[item.id] = true;
        source.completed.push(item.id);
    }
    let serialization = 0, sanitization = 0, storage = 0, payload;
    for (let i = 0; i < 30; i++) {
        let t = performance.now();
        payload = JSON.stringify(source);
        serialization += performance.now() - t;
        t = performance.now();
        const clean = sanitizeUserProgress(source);
        sanitization += performance.now() - t;
        t = performance.now();
        db.prepare('INSERT OR REPLACE INTO progress VALUES (1,?)').run(JSON.stringify(clean));
        storage += performance.now() - t;
    }
    progress.push({ activities: count, bytes: Buffer.byteLength(payload), serializeMs: serialization / 30, sanitizeMs: sanitization / 30, sqliteMemoryMs: storage / 30 });
}
db.close();
const html = readFileSync('public/devpath.html', 'utf8');
const scripts = [...html.matchAll(/<script[^>]* src="\/([^"?]+)(?:\?[^" ]*)?"/g)].map(m => m[1]);
const assets = scripts.map(path => { const data = readFileSync('public/' + path); return { path, bytes: data.length, gzipBytes: gzipSync(data).length }; });
const runtimeInventory = Object.fromEntries([...new Set(catalog.map(item => item.runtime))].map(runtime => [runtime, catalog.filter(item => item.runtime === runtime).length]));
const moduleActivities = catalog.filter(item => item.starterFiles.some(file => /\.m?js$/.test(file.path) && /\b(?:import|export)\s/.test(file.content))).map(item => ({ id: item.id, runtime: item.runtime, files: item.starterFiles.map(file => file.path) }));
const result = { runtimeInventory, moduleActivities, syntheticProgress: progress, initialScripts: assets.length, scriptBytes: assets.reduce((n, a) => n + a.bytes, 0), scriptGzipBytes: assets.reduce((n, a) => n + a.gzipBytes, 0), compilerScriptBytes: readFileSync('public/compiler-runtime/compiler.js').length, compilerWasmBytes: readFileSync('public/compiler-runtime/compiler.wasm').length, assets };
writeFileSync('work/engineering-metrics.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify({ ...result, assets: undefined }, null, 2));
