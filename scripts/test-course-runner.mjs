import {withPublicDependencies} from './public-test-source.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import {Worker as NodeWorker} from 'node:worker_threads';
import {JSDOM} from 'jsdom';

// Execute the actual iframe bootstrap with real worker threads. Browser checks
// additionally cover the sandbox and CSP, which jsdom does not implement.
function setup() {
  const dom = new JSDOM('<body></body>', {url: 'http://localhost', runScripts: 'outside-only'});
  const w = dom.window;
  const workers = new Set();
  const terminate = worker => { workers.delete(worker); void worker.terminate(); };
  w.document.body.append = frame => {
    w.document.body.appendChild(frame);
    const source = frame.srcdoc.match(/<script>([\s\S]*)<\/script>/)[1];
    const events = new Map();
    const urls = new Map();
    const parent = {postMessage(data) {
      w.dispatchEvent(new w.MessageEvent('message', {source: frame.contentWindow, data}));
    }};
    const originalRemove = frame.remove.bind(frame);
    frame.remove = () => { events.get('pagehide')?.(); originalRemove(); };
    class Worker {
      constructor(url) {
        this.thread = new NodeWorker(`
          const {parentPort} = require('node:worker_threads');
          globalThis.self = globalThis;
          self.postMessage = data => parentPort.postMessage(data);
          parentPort.on('message', data => self.onmessage({data}));
          ${urls.get(url)}
        `, {eval: true});
        workers.add(this.thread);
        this.thread.on('message', data => this.onmessage?.({data}));
        this.thread.on('error', error => this.onerror?.({message: error.message, preventDefault() {}}));
      }
      postMessage(data) { this.thread.postMessage(data); }
      terminate() { terminate(this.thread); }
    }
    vm.runInNewContext(source, {
      Blob: class {constructor(parts) { this.source = parts.join(''); }},
      URL: {createObjectURL(blob) {const key = String(urls.size); urls.set(key, blob.source); return key;}, revokeObjectURL(key) {urls.delete(key);}},
      Worker, parent, addEventListener(name, callback) {events.set(name, callback);}
    });
  };
  w.eval(withPublicDependencies(readFileSync(new URL('../public/js-course-runner.js', import.meta.url), 'utf8')));
  const run = (code, timeoutMs = 2000) => new Promise(resolve => {
    w.DevPathCourseRunner.run(code, (kind, text) => resolve({kind, text}), {timeoutMs});
  });
  return {w, run, workers, close() {for (const worker of workers) terminate(worker); dom.window.close();}};
}

test('runner executes multiline code, preserves script-like text, and reports syntax errors', async () => {
  const env = setup();
  try {
    assert.deepEqual(await env.run('console.log(2 + 3);\nconsole.log("</script><img>");'), {kind: 'result', text: '5\n</script><img>'});
    assert.equal((await env.run('const = ;')).kind, 'error');
    assert.equal(env.workers.size, 0);
    assert.equal(env.w.document.querySelectorAll('iframe').length, 0);
  } finally {env.close();}
});

test('an infinite loop is terminated and does not prevent the next execution', async () => {
  const env = setup();
  try {
    assert.equal((await env.run('while (true) {}', 200)).kind, 'timeout');
    assert.equal(env.workers.size, 0);
    assert.deepEqual(await env.run('console.log("recuperado");'), {kind: 'result', text: 'recuperado'});
  } finally {env.close();}
});

test('output is bounded and cancellation releases the running worker', async () => {
  const env = setup();
  try {
    const output = await env.run('for(let i=0;i<10000;i++) console.log("abcdefghij");');
    assert.equal(output.kind, 'error');
    assert.match(output.text, /Limite de saída/);
    let cancelled;
    const stop = env.w.DevPathCourseRunner.run('while(true){}', kind => {cancelled = kind;});
    stop();
    assert.equal(cancelled, 'cancelled');
    assert.equal(env.workers.size, 0);
  } finally {env.close();}
});
