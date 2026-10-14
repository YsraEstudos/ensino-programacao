(function (global) {
  'use strict';

  const safePath = value => typeof value === 'string' && value.length > 0 && !value.startsWith('/') && !value.includes('\\') && !/^(?:[a-z]+:|\/\/)/i.test(value) && !/(^|\/)\.\.(?:\/|$)/.test(value);
  const normalize = (value, base = '') => {
    if (!safePath(value)) throw new Error('O Worker aceita apenas arquivos locais.');
    const parts = base ? base.split('/').slice(0, -1) : [];
    for (const part of value.split('/')) {
      if (!part || part === '.') continue;
      if (part === '..') { if (!parts.length) throw new Error('O import do Worker sai dos arquivos locais.'); parts.pop(); }
      else parts.push(part);
    }
    return parts.join('/');
  };
  const newUrlSpecifier = /new\s+URL\(\s*(["'])(\.\.?\/[^"']+)\1\s*,\s*import\.meta\.url\s*\)/g;

  async function bundleWorkerEntries({files = [], workerEntries = [], assertionCases = []} = {}) {
    const entries = Array.isArray(workerEntries) ? workerEntries : Object.keys(workerEntries || {});
    const extra = Array.isArray(workerEntries) ? [] : Object.entries(workerEntries || {}).map(([path, content]) => ({path, content}));
    const workerFiles = [...files.filter(file => !extra.some(item => item.path === file.path)), ...extra];
    if (!global.DevPathModuleGraph?.buildModuleGraph) throw new Error('O grafo local ainda não está pronto para empacotar o Worker.');
    const output = {};
    for (const entry of entries) {
      if (!safePath(entry) || !workerFiles.some(file => file.path === entry)) throw new Error(`Entrada de Worker ausente ou inválida: ${entry}`);
      const graph = await global.DevPathModuleGraph.buildModuleGraph({files: workerFiles, entryPath: entry, assertionCases});
      output[entry] = graph.code;
    }
    return output;
  }

  function createWorkerPreview({files = [], workerEntries = [], signal} = {}) {
    if (!global.URL?.createObjectURL || !global.Blob || typeof global.Worker !== 'function') throw new Error('Preview de Worker indisponível neste navegador.');
    const map = new Map();
    for (const file of Array.isArray(files) ? files : []) {
      const path = normalize(file?.path || '');
      if (!/\.m?js$/i.test(path) || typeof file.content !== 'string') throw new Error(`Arquivo de Worker inválido: ${path}`);
      if (map.has(path)) throw new Error(`Arquivo de Worker duplicado: ${path}`);
      map.set(path, file.content);
    }
    const entries = Array.isArray(workerEntries) ? workerEntries : Object.keys(workerEntries || {});
    const entryPaths = entries.map(entry => normalize(typeof entry === 'string' ? entry : entry?.path || ''));
    if (!entryPaths.length) throw new Error('Nenhuma entrada local de Worker foi declarada.');
    for (const path of entryPaths) if (!map.has(path)) throw new Error(`Entrada de Worker ausente: ${path}`);
    const urls = new Map();
    const ownedUrls = new Set();
    const workers = new Set();
    let disposed = false;
    const bundled = new Set();
    const inline = (path) => {
      if (bundled.has(path)) return '';
      bundled.add(path);
      let source = map.get(path);
      if (source === undefined) throw new Error(`Arquivo de Worker ausente: ${path}`);
      source = source.replace(/import\s+\{([^}]+)\}\s+from\s*(["'])(\.\.?\/[^"']+)\2\s*;?/g, (full, bindings, quote, spec) => {
        const target = normalize(spec, path);
        return `${inline(target)}\n`;
      });
      source = source.replace(/import\s*(["'])(\.\.?\/[^"']+)\1\s*;?/g, (full, quote, spec) => inline(normalize(spec, path)));
      source = source.replace(/\bexport\s+(?=(?:const|let|var|function|class)\b)/g, '');
      source = source.replace(/\bexport\s*\{[^}]*\}\s*;?/g, '');
      source = source.replace(newUrlSpecifier, (full, quote, spec) => {
        // The local module is inlined into this worker entry. Preserve a local
        // module URL without allowing the original relative URL to escape the
        // owned blob asset.
        normalize(spec, path);
        return 'import.meta.url';
      });
      source = source.replace(/\bimportScripts\s*\(\s*(["'])(https?:|data:|blob:)/g, () => { throw new Error('importScripts externo não é permitido.'); });
      return source;
    };
    try {
      for (const path of entryPaths) {
        bundled.clear();
        const configured = !Array.isArray(workerEntries) && typeof workerEntries[path] === 'string' ? workerEntries[path] : inline(path);
        const url = global.URL.createObjectURL(new global.Blob([configured], {type: 'text/javascript'}));
        urls.set(path, url); ownedUrls.add(url);
      }
    } catch (error) {
      for (const url of ownedUrls) global.URL.revokeObjectURL(url);
      throw error;
    }
    const onAbort = () => dispose();
    signal?.addEventListener?.('abort', onAbort, {once: true});
    function resolve(entryPath) {
      const path = normalize(entryPath);
      if (disposed || !urls.has(path) || !entryPaths.includes(path)) throw new Error('Entrada de Worker fora da tentativa atual.');
      return urls.get(path);
    }
    function track(worker) {
      if (!worker || typeof worker.terminate !== 'function') throw new Error('Worker inválido.');
      if (disposed) { worker.terminate(); throw new Error('Preview de Worker já foi encerrado.'); }
      workers.add(worker);
      const remove = () => workers.delete(worker);
      worker.addEventListener?.('error', remove, {once: true});
      return worker;
    }
    function dispose() {
      if (disposed) return;
      disposed = true;
      signal?.removeEventListener?.('abort', onAbort);
      for (const worker of workers) { try { worker.terminate(); } catch { /* teardown is best effort */ } }
      workers.clear();
      for (const url of ownedUrls) global.URL.revokeObjectURL(url);
      ownedUrls.clear();
      urls.clear();
    }
    return Object.freeze({resolve, track, dispose, get size() { return workers.size; }});
  }

  global.DevPathWorkerPreview = Object.freeze({createWorkerPreview, bundleWorkerEntries});
})(window);
