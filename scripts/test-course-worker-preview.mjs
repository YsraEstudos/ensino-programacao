import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

function api(DevPathModuleGraph) {
  let next = 0;
  const blobs = new Map();
  const window = {
    Blob: class { constructor(parts) { this.source = parts.join(''); } },
    URL: {createObjectURL(blob) { const url = `blob:task6-${next++}`; blobs.set(url, blob.source); return url; }, revokeObjectURL(url) { blobs.delete(url); }},
    Worker: class { terminate() { this.terminated = true; } addEventListener() {} },
    crypto: {randomUUID: () => 'worker-token'},
    DevPathModuleGraph,
  };
  window.window = window;
  vm.runInNewContext(readFileSync('public/course-worker-preview.js', 'utf8'), {window});
  return {api: window.DevPathWorkerPreview, blobs};
}

test('Worker bundle forwards assertion cases to the graph that receives the whole fixture file set', async () => {
  const assertionCases = [{id: '21.05.real-worker-response-ids'}];
  const calls = [];
  const {api: workerApi} = api({
    async buildModuleGraph(spec) {
      calls.push(spec);
      return {code: 'self.onmessage = () => {};'};
    },
  });
  const files = [
    {path: 'main.js', content: 'new Worker(new URL("./worker.js", import.meta.url));'},
    {path: 'worker.js', content: 'self.onmessage = () => {};'},
    {path: 'tests/21.05.test.js', content: '/*@case 21.05.real-worker-response-ids*/ expect(1).toBe(1);'},
  ];

  await workerApi.bundleWorkerEntries({files, workerEntries: ['worker.js'], assertionCases});

  assert.equal(calls.length, 1);
  assert.equal(calls[0].entryPath, 'worker.js');
  assert.equal(JSON.stringify(calls[0].files), JSON.stringify(files));
  assert.equal(JSON.stringify(calls[0].assertionCases), JSON.stringify(assertionCases));
});

test('Worker preview rewrites local module and import.meta URLs and owns the assets', () => {
  const loaded = api();
  const {api: workerApi, blobs} = loaded;
  const preview = workerApi.createWorkerPreview({files: [
    {path: 'worker.js', content: 'import {count} from "./primos.js"; new URL("./primos.js", import.meta.url); self.onmessage=()=>count();'},
    {path: 'primos.js', content: 'export const count=()=>7;'},
  ], workerEntries: ['worker.js']});
  const url = preview.resolve('worker.js');
  assert.match(url, /^blob:task6-/);
  assert.equal([...blobs.values()].some(source => source.includes('./primos.js')), false);
  preview.dispose();
  assert.equal(blobs.size, 0);
  assert.throws(() => preview.resolve('worker.js'), /encerrada|tentativa/i);
});

test('Worker preview terminates tracked workers on abort and rejects foreign entries', () => {
  const {api: workerApi} = api();
  const controller = new AbortController();
  const preview = workerApi.createWorkerPreview({files: [{path: 'worker.js', content: ''}], workerEntries: ['worker.js'], signal: controller.signal});
  const worker = new class { terminate() { this.terminated = true; } addEventListener() {} }();
  preview.track(worker);
  controller.abort();
  assert.equal(worker.terminated, true);
  assert.throws(() => preview.resolve('other.js'), /entrada|local/i);
});
