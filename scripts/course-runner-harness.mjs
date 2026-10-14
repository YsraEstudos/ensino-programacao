import {withPublicDependencies} from './public-test-source.mjs';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {Worker as NodeWorker} from 'node:worker_threads';
import {JSDOM} from 'jsdom';

// Execute the actual iframe bootstrap with real worker threads. Browser checks
// additionally cover the sandbox and CSP, which jsdom does not implement.
export function setup({failWorker = false} = {}) {
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
        w.dispatchEvent(new w.MessageEvent('message', {source: frame.contentWindow, origin: 'null', data}));
    }};
    const originalRemove = frame.remove.bind(frame);
    frame.remove = () => { events.get('pagehide')?.(); originalRemove(); };
    class Worker {
      constructor(url) {
        if (failWorker) throw new Error("Worker indisponível");
        this.thread = new NodeWorker(`
          const {parentPort} = require('node:worker_threads');
          globalThis.self = globalThis;
          self.postMessage = data => parentPort.postMessage(data);
          parentPort.on('message', data => self.onmessage({data}));
          const rejectionListeners = new Map();
          self.addEventListener = (name, callback) => {
            if (name === 'unhandledrejection') {
              const listener = reason => callback({reason});
              rejectionListeners.set(callback, listener);
              process.on('unhandledRejection', listener);
            }
          };
          self.removeEventListener = (name, callback) => {
            if (name === 'unhandledrejection') {
              const listener = rejectionListeners.get(callback);
              if (listener) process.off('unhandledRejection', listener);
              rejectionListeners.delete(callback);
            }
          };
          // Node cannot import blob: URLs; module code is imported through data: URLs instead.
          globalThis.Blob = class {constructor(parts) {this.source = parts.join('');}};
          URL.createObjectURL = blob => 'data:text/javascript;base64,' + Buffer.from(blob.source).toString('base64');
          URL.revokeObjectURL = () => {};
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
      document: w.document,
      window: w,
      console: w.console,
      Blob: class {constructor(parts) { this.source = parts.join(''); }},
      URL: {createObjectURL(blob) {const key = String(urls.size); urls.set(key, blob.source); return key;}, revokeObjectURL(key) {urls.delete(key);}},
      Worker,
      parent,
      addEventListener(name, callback, options) {
        events.set(name, callback);
        if (name === 'message') w.addEventListener('message', callback, options);
      },
      removeEventListener(name, callback, options) {
        events.delete(name);
        if (name === 'message') w.removeEventListener('message', callback, options);
      }
    }, {
      importModuleDynamically(specifier) {
        const source = urls.get(String(specifier));
        if (source === undefined) return import(String(specifier));
        return import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
      }
    });
  };
  w.eval(withPublicDependencies(readFileSync(new URL('../public/course-test-runtime.js', import.meta.url), 'utf8')));
  w.eval(withPublicDependencies(readFileSync(new URL('../public/course-runner.js', import.meta.url), 'utf8')));
  const run = (code, timeoutMs = 2000, caseRecords = []) => new Promise(resolve => {
    w.DevPathCourseRunner.run(code, (kind, text, tests) => resolve(tests ? {kind, text, tests} : {kind, text}), {timeoutMs, caseRecords});
  });
  // Keep the harness independent from a main.js convention: callers may pass
  // any compiled entry produced from a multi-file reference project.
  const runModule = (graph, timeoutMs = 2000, caseRecords = []) => run({module: graph.code}, timeoutMs, caseRecords);
  return {w, run, runModule, workers, async close() {
    const activeWorkers = [...workers];
    workers.clear();
    await Promise.all(activeWorkers.map(worker => worker.terminate()));
    dom.window.close();
  }};
}
