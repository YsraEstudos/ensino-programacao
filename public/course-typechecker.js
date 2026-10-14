(function (global) {
  'use strict';
  function resultText(kind, diagnostics) {
    if (kind === 'passed') return 'TypeScript verificado com sucesso.';
    if (kind === 'type-error') return `TypeScript encontrou ${(diagnostics || []).length} diagnóstico(s).`;
    if (kind === 'unsupported') return 'Ambiente TypeScript não suportado.';
    if (kind === 'timeout') return 'A verificação TypeScript excedeu o tempo limite.';
    if (kind === 'cancelled') return 'A verificação TypeScript foi cancelada.';
    return 'A verificação TypeScript falhou.';
  }
  function withText(result) {
    return result?.text ? result : { ...result, text: resultText(result?.kind, result?.diagnostics) };
  }
  function token() {
    return global.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  function check(input, { signal, timeoutMs = 10000 } = {}) {
    if (signal?.aborted) return Promise.resolve(withText({ kind: 'cancelled', supported: false, diagnostics: [], source: 'browser' }));
    const assets = global.DevPathCompilerAssets;
    if (!assets?.typecheckWorker || !assets?.typecheckLibraries || typeof global.Worker !== 'function') {
      return Promise.resolve(withText({ kind: 'unsupported', supported: false, diagnostics: [{ category: 'error', code: 0, message: 'O verificador TypeScript local não está disponível.' }], source: 'browser' }));
    }
    const requestToken = token();
    let worker;
    let settled = false;
    let timeout;
    let abortListener;
    const fetchController = typeof global.AbortController === 'function' ? new global.AbortController() : null;
    const promise = new Promise(resolve => {
      const finish = result => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        fetchController?.abort?.();
        signal?.removeEventListener?.('abort', abortListener);
        worker?.removeEventListener?.('message', onMessage);
        worker?.removeEventListener?.('error', onError);
        worker?.terminate?.();
        resolve(withText(result));
      };
      const onMessage = event => {
        if (event.data?.token !== requestToken || !event.data?.result) return;
        finish(event.data.result);
      };
      const onError = event => finish({ kind: 'unsupported', supported: false, diagnostics: [{ category: 'error', code: 0, message: event.message || 'Não foi possível iniciar o verificador TypeScript local.' }], source: 'browser' });
      abortListener = () => finish({ kind: 'cancelled', supported: false, diagnostics: [], source: 'browser' });
      signal?.addEventListener?.('abort', abortListener, { once: true });
      timeout = setTimeout(() => finish({ kind: 'timeout', supported: false, diagnostics: [], source: 'browser' }), Math.max(1, Number(timeoutMs) || 10000));
      try {
        worker = new global.Worker(assets.typecheckWorker);
        worker.addEventListener('message', onMessage);
        worker.addEventListener('error', onError);
        global.fetch(assets.typecheckLibraries, { cache: 'force-cache', ...(fetchController ? { signal: fetchController.signal } : {}) }).then(response => {
          if (!response.ok) throw new Error(`Bibliotecas TypeScript locais indisponíveis (${response.status}).`);
          return response.json();
        }).then(libraries => {
          if (!settled) worker.postMessage({ token: requestToken, input, libraries });
        }).catch(error => onError({ message: error instanceof Error ? error.message : String(error) }));
      } catch (error) {
        onError({ message: error instanceof Error ? error.message : String(error) });
      }
    });
    return promise;
  }
  global.DevPathTypeChecker = Object.freeze({ check });
})(window);
