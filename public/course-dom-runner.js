(function (global) {
  'use strict';

  const safePath = value => typeof value === 'string' && value.length > 0 && !value.startsWith('/') && !value.includes('\\') && !/^(?:[a-z]+:|\/\/)/i.test(value) && !/(^|\/)\.\.(?:\/|$)/.test(value);
  const result = (kind, text, extra = {}) => ({kind, text, source: 'browser', diagnostics: [], ...extra});
  const safeJson = value => JSON.stringify(value).replace(/</g, '\\u003c');
  const memoryStorageSource = `(() => { const data = new Map(); return { get length(){return data.size}, key(i){return [...data.keys()][i] ?? null}, getItem(k){return data.has(String(k)) ? data.get(String(k)) : null}, setItem(k,v){data.set(String(k),String(v))}, removeItem(k){data.delete(String(k))}, clear(){data.clear()} }; })()`;
  const workerBootstrapFor = source => `(function(){
    const __source=${JSON.stringify(source)};
    const __pending=[]; const __listeners=[]; let __ready=false; let __propertyHandler=null;
    const __rawAdd=self.addEventListener.bind(self);
    self.addEventListener=(type,listener,options)=>{if(type==='message'&&!__ready){__listeners.push({listener,options});return;}return __rawAdd(type,listener,options);};
    try{Object.defineProperty(self,'onmessage',{configurable:true,get:()=>__propertyHandler,set:handler=>{__propertyHandler=handler;if(__ready&&handler)__rawAdd('message',handler);}});}catch{}
    __rawAdd('message',event=>{if(!__ready)__pending.push(event);});
    (async()=>{try{const __url=URL.createObjectURL(new Blob([__source],{type:'text/javascript'}));await import(__url);URL.revokeObjectURL(__url);__ready=true;for(const item of __listeners)__rawAdd('message',item.listener,item.options);if(__propertyHandler)__rawAdd('message',__propertyHandler);for(const event of __pending){for(const item of __listeners)item.listener(event);if(__propertyHandler)__propertyHandler(event);}}catch(error){const message=error?.stack||error?.message||String(error);self.postMessage({__devpathWorkerError:message});}})();
  })();`;
  // Loop guard for the student's code. Every while/for/do/for-in/for-of body
  // gets a call to LOOP_GUARD_TICK at its start. The guard samples the clock
  // every 1024 iterations of a loop site; if one run of a site lasts longer
  // than LOOP_GUARD_MS it throws. A pause longer than 250 ms between samples
  // counts as a new run, so loops that wait on timers are not cut short.
  // LIMIT, stated to the student in the message: this does NOT cover deep
  // recursion, catastrophic-backtracking regexes or blocking API calls, and it
  // does not cancel code that is not inside a loop. Full cancellation is plan item M.3.
  const LOOP_GUARD_MS = 1000;
  const LOOP_GUARD_TICK = '__devpathLoopTick';
  const LOOP_NODE_TYPES = new Set(['WhileStatement', 'DoWhileStatement', 'ForStatement', 'ForInStatement', 'ForOfStatement']);
  // Runs inside the sandboxed frame, before any student code. Serialized with Function#toString,
  // so it must stay self-contained.
  function installLoopGuard(limitMs) {
    const now = () => (typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now());
    const message = ms => `Laço provavelmente infinito: execução interrompida após ${ms} ms. O executor interrompe apenas laços while, for e do; não cobre recursão profunda, regex com retrocesso catastrófico nem chamadas de API bloqueantes.`;
    const sites = [];
    let tripped = null;
    Object.defineProperty(globalThis, '__devpathLoopTick', {configurable: false, enumerable: false, writable: false, value: function (id) {
      if (tripped !== null) throw new Error(tripped);
      let site = sites[id];
      if (site === undefined) site = sites[id] = {count: 0, start: 0, last: -Infinity};
      if ((++site.count & 1023) !== 0) return;
      const t = now();
      if (t - site.last > 250) site.start = t;
      site.last = t;
      const elapsed = t - site.start;
      if (elapsed > limitMs) { tripped = message(Math.round(elapsed)); throw new Error(tripped); }
    }});
  }
  // Parser-based instrumentation. `parse` is the acorn parser bundled with the
  // local compiler (DevPathCompilerEngine.parse). Insertions are made by source
  // offset, so strings, template literals, comments and regex literals are
  // never touched, and labels/continue keep their targets because the guard
  // call goes inside the loop body, never around the loop statement.
  function instrumentLoops(code, parse) {
    if (typeof parse !== 'function') throw new Error('Não foi possível proteger os laços do código: o analisador local não está disponível.');
    const ast = parse(code, {ecmaVersion: 'latest', sourceType: 'module'});
    const loops = [];
    const visit = node => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) { node.forEach(visit); return; }
      if (typeof node.type === 'string' && LOOP_NODE_TYPES.has(node.type)) loops.push(node);
      for (const key of Object.keys(node)) {
        if (key === 'start' || key === 'end' || key === 'loc') continue;
        const value = node[key];
        if (value && typeof value === 'object') visit(value);
      }
    };
    visit(ast);
    if (!loops.length) return code;
    const edits = [];
    loops.forEach((loop, id) => {
      const body = loop.body;
      if (body.type === 'BlockStatement') edits.push({at: body.start + 1, text: ` ${LOOP_GUARD_TICK}(${id});`});
      else edits.push({at: body.start, text: `{${LOOP_GUARD_TICK}(${id});`}, {at: body.end, text: '}'});
    });
    edits.sort((a, b) => a.at - b.at);
    let output = '';
    let last = 0;
    for (const edit of edits) {
      output += code.slice(last, edit.at) + edit.text;
      last = edit.at;
    }
    return output + code.slice(last);
  }
  function validate(spec) {
    if (!spec || !Array.isArray(spec.files) || !spec.files.length) throw new Error('O exercício DOM precisa de arquivos locais.');
    if (!safePath(spec.entryPath) || !spec.files.some(file => file?.path === spec.entryPath)) throw new Error('A entrada DOM não existe nos arquivos locais.');
    if (spec.files.some(file => !safePath(file?.path) || typeof file.content !== 'string')) throw new Error('Há um arquivo DOM inválido.');
  }
  async function workerSourcesFor(spec, codeFiles, assertionCases = []) {
    const declared = spec.fixtures?.workerEntries;
    if (!declared) return {};
    if (!global.DevPathWorkerPreview?.bundleWorkerEntries) throw new Error('O empacotador local de Worker não está disponível.');
    return global.DevPathWorkerPreview.bundleWorkerEntries({files: codeFiles, workerEntries: declared, assertionCases});
  }
  function run(spec = {}, options = {}) {
    let validated;
    try { validate(spec); validated = true; } catch (error) { return Promise.resolve(result('error', error.message)); }
    const signal = options.signal;
    if (signal?.aborted) return Promise.resolve(result('cancelled', 'A avaliação foi cancelada.'));
    if (!global.document?.createElement || !global.DevPathModuleGraph?.buildModuleGraph) return Promise.resolve(result('unsupported', 'A avaliação DOM exige um navegador com documento e compilador local.'));
    const timeoutMs = Math.max(50, Number(options.timeoutMs) || 2000);
    const token = global.crypto?.randomUUID?.();
    if (!token) return Promise.resolve(result('error', 'A avaliação DOM não pôde criar um token seguro.'));
    const interactive = Boolean(options.interactive || spec.fixtures?.interactive);
    const iframe = global.document.createElement('iframe');
    iframe.setAttribute('sandbox', interactive ? 'allow-scripts allow-forms' : 'allow-scripts');
    iframe.title = 'Pré-visualização DOM da atividade';
    iframe.setAttribute('aria-label', 'Pré-visualização DOM da atividade');
    if (!interactive) iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = interactive ? 'width:100%;min-height:240px;border:1px solid #ccc;' : 'position:fixed;width:1px;height:1px;left:-10000px;border:0;';
    const parentOrigin = global.location?.origin || 'null';
    let moduleUrl;
    let settled = false;
    let timeoutId;
    let onMessage;
    let onAbort;
    const finish = (value, remove = true) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      global.removeEventListener?.('message', onMessage);
      signal?.removeEventListener?.('abort', onAbort);
      if (remove) iframe.remove();
      if (moduleUrl) global.URL?.revokeObjectURL?.(moduleUrl);
      resolvePromise(value);
    };
    let resolvePromise;
    const promise = new Promise(resolve => { resolvePromise = resolve; });
    onAbort = () => finish(result('cancelled', 'A avaliação foi cancelada.'));
    signal?.addEventListener?.('abort', onAbort, {once: true});
    timeoutId = global.setTimeout(() => finish(result('timeout', 'A avaliação DOM excedeu o tempo limite.')), timeoutMs);
    (async () => {
      try {
        const codeFiles = spec.files.filter(file => /\.(?:m?js|jsx|ts|tsx|json)$/i.test(file.path));
        const codeEntry = /\.(?:m?js|jsx|ts|tsx|json)$/i.test(spec.entryPath) ? spec.entryPath : (spec.fixtures?.entryPath || codeFiles.find(file => /\.(?:m?js|jsx|ts|tsx)$/i.test(file.path))?.path);
        const testCode = typeof spec.testCode === 'string' ? spec.testCode : '';
        const declaredTestPaths = Array.isArray(spec.testPaths)
          ? spec.testPaths.filter(path => safePath(path))
          : Array.isArray(spec.fixtures?.testPaths)
            ? spec.fixtures.testPaths.filter(path => safePath(path))
            : codeFiles.filter(file => /(?:^|\/)(?:test|tests)\//i.test(file.path) || /\.(?:test|spec)\.[cm]?[jt]sx?$/i.test(file.path)).map(file => file.path);
        const effectiveTestCode = testCode.trim() || (declaredTestPaths.length
          ? declaredTestPaths.map(path => `import ${JSON.stringify(`./${path}`)};`).join('\n')
          : '');
        const testPath = '__devpath_dom_tests__.js';
        const executionFiles = effectiveTestCode && codeEntry
          ? [...codeFiles, {path: testPath, content: `import * as __devpathEntry from ${JSON.stringify(`./${codeEntry}`)}; globalThis.__devpathEntry = __devpathEntry;\n${effectiveTestCode}`}]
          : codeFiles;
        const executionEntry = effectiveTestCode && codeEntry ? testPath : codeEntry;
        const graph = executionEntry ? await global.DevPathModuleGraph.buildModuleGraph({files: executionFiles, entryPath: executionEntry, assertionCases: options.assertionCases || spec.assertionCases || []}) : {code: ''};
        if (signal?.aborted) { finish(result('cancelled', 'A avaliação foi cancelada.')); return; }
        if (settled) return;
        // The module blob is created inside the opaque frame. A parent-origin
        // blob URL can be rejected by a browser when imported from origin null.
        const workerSources = await workerSourcesFor(spec, codeFiles, options.assertionCases || spec.assertionCases || []);
        // Throws (and the run ends with an error) if the parser is missing, rather than running unguarded.
        let moduleSource = instrumentLoops(graph.code, global.DevPathCompilerEngine?.parse);
        moduleSource = moduleSource.replace(/new\s+URL\(\s*(["'])(\.\.?\/[^"']+)\1\s*,\s*import\.meta\.url\s*\)/g, (full, quote, specifier) => {
          const path = specifier.split('/').filter(part => part !== '.').join('/');
          return workerSources[path] ? `globalThis.__devpathWorkerURLs[${safeJson(path)}]` : full;
        });
        // A module Worker can fail to bootstrap from an opaque sandbox origin
        // on Chromium. The URL remains a real Worker asset, while its classic
        // bootstrap creates/imports the ESM blob inside the Worker realm.
        moduleSource = moduleSource.replace(/(new\s+Worker\([^,]+,\s*\{)\s*type:\s*["']module["']\s*,?/g, '$1');
        const htmlFile = spec.files.find(file => file.path === spec.entryPath && /\.html?$/i.test(file.path));
        const cssFile = spec.files.find(file => /\.css$/i.test(file.path));
        const html = htmlFile?.content || (typeof spec.fixtures?.html === 'string' ? spec.fixtures.html : '');
        const cssText = typeof spec.fixtures?.css === 'string' ? spec.fixtures.css : cssFile?.content;
        const css = typeof cssText === 'string' ? `<style>${cssText}</style>` : '';
        const runtimeSource = global.DevPathTestRuntime?.source || '';
        const networkSource = global.DevPathNetwork?.source || '';
        const bootstrap = `
          (${installLoopGuard})(${LOOP_GUARD_MS});
          const token=${safeJson(token)}, parentOrigin=${safeJson(parentOrigin)};
          const send=(kind,text,extra={})=>parent.postMessage({token,kind,text,...extra},parentOrigin);
          const storage=${memoryStorageSource};
          try { Object.defineProperty(globalThis,'localStorage',{configurable:true,value:storage}); Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:storage}); } catch {}
          document.body.innerHTML=${safeJson(`${html}${css}`)};
          const __moduleUrl=URL.createObjectURL(new Blob([${safeJson(moduleSource)}],{type:'text/javascript'}));
          const __workerURLs={}; const __ownedWorkers=new Set();
          for (const [path,source] of Object.entries(${safeJson(Object.fromEntries(Object.entries(workerSources).map(([path, source]) => [path, workerBootstrapFor(source)])))})) __workerURLs[path]=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
          globalThis.__devpathWorkerURLs=__workerURLs;
          const __NativeWorker=globalThis.Worker;
          const __ownedWorkerURLs=new Set(Object.values(__workerURLs));
          const __cleanup=()=>{for(const worker of __ownedWorkers){try{worker.terminate();}catch{}}__ownedWorkers.clear();for(const url of __ownedWorkerURLs)URL.revokeObjectURL(url);URL.revokeObjectURL(__moduleUrl);};
          addEventListener('pagehide',__cleanup,{once:true});
          if (__NativeWorker) globalThis.Worker=class extends __NativeWorker { constructor(url,options){const candidate=typeof url==='string'?url:url?.href;if(!__ownedWorkerURLs.has(candidate))throw new Error('Worker fora dos assets locais da tentativa.');const safeOptions=options?.type==='module'?{...options,type:'classic'}:options;super(candidate,safeOptions);super.addEventListener('message',event=>{const message=event.data?.__devpathWorkerError;if(!message)return;event.stopImmediatePropagation?.();const error=new Error(message);const errorEvent=typeof ErrorEvent==='function'?new ErrorEvent('error',{message,error}):{message,error,error};if(typeof this.onerror==='function')this.onerror(errorEvent);});__ownedWorkers.add(this);} terminate(){__ownedWorkers.delete(this);return super.terminate();} };
          window.__devpathFixtures = ${safeJson(spec.fixtures?.data || {})};
          ${networkSource && spec.fixtures?.network ? `const createNetworkFixtures=${networkSource}; const __network=createNetworkFixtures(${safeJson(Array.isArray(spec.fixtures.network) ? spec.fixtures.network : spec.fixtures.network.routes || [])}); window.fetch=__network.fetch; window.__devpathNetwork=__network;` : ''}
          window.addEventListener('error', event => send('error', event.error?.message || event.message || 'Erro no DOM'));
          ${runtimeSource ? `const createTestRuntime=${runtimeSource}; const runtime=createTestRuntime({target:window,caseRecords:${safeJson(options.assertionCases || spec.assertionCases || [])}}); runtime.install(window); window.__devpathRuntime=runtime;` : ''}
          (async()=>{
            try {
              const entry = await import(__moduleUrl); window.__devpathEntry = entry;
              if (!${Boolean(effectiveTestCode)}) send('failed','A suíte DOM está vazia.',{tests:{passed:0,failed:0,total:0}});
              else if (window.__devpathRuntime) { const tests=await window.__devpathRuntime.run(); send(tests.total < 1 || tests.failed ? 'failed' : 'passed', tests.text || 'Avaliação DOM concluída.', {tests}); }
              else send('unsupported','O runtime de testes DOM não está disponível.',{tests:{passed:0,failed:0,total:0}});
            } catch (error) { send('error', error?.stack || error?.message || String(error)); }
            finally { __cleanup(); }
          })();`;
        iframe.srcdoc = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; style-src 'unsafe-inline'; worker-src blob:; connect-src 'none'; img-src 'none'; media-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"><body><script>${bootstrap.replace(/<\/script/gi, '<\\/script')}</script></body>`;
        onMessage = event => {
          if (event.source !== iframe.contentWindow || event.origin !== 'null' || event.data?.token !== token) return;
          const value = event.data;
          const kind = new Set(['passed', 'failed', 'unsupported', 'timeout', 'cancelled', 'error']).has(value.kind) ? value.kind : 'error';
          finish(result(kind, value.text || 'A avaliação DOM falhou.', {tests: value.tests}));
        };
        global.addEventListener('message', onMessage);
        if (!settled) global.document.body.append(iframe);
      } catch (error) { finish(result('error', error instanceof Error ? error.message : String(error))); }
    })();
    return promise;
  }
  global.DevPathDomRunner = Object.freeze({run, validate, instrumentLoops, installLoopGuard, LOOP_GUARD_MS, LOOP_GUARD_TICK});
})(window);
