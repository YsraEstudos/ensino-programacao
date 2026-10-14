(function (global) {
  'use strict';

  const localPath = value => typeof value === 'string' && !/^(?:[a-z]+:|\/\/)/i.test(value) && !value.includes('\\') && !/(^|\/)\.\.(?:\/|$)/.test(value);
  const abortError = () => new global.DOMException('A requisição foi cancelada.', 'AbortError');
  const asMethod = value => String(value || 'GET').toUpperCase();
  const asUrl = input => typeof input === 'string' ? input : input?.url;
  const responseBody = (body, headers) => {
    if (body === undefined || body === null) return undefined;
    if (typeof body === 'string' || body instanceof global.Blob || body instanceof global.ArrayBuffer) return body;
    if (headers.get('content-type')?.includes('json')) return JSON.stringify(body);
    return String(body);
  };
  const responseFor = (entry, sequence) => {
    const headers = new global.Headers(entry.headers || {});
    if (entry.body !== undefined && !headers.has('content-type') && typeof entry.body !== 'string') headers.set('content-type', 'application/json');
    const status = Number.isInteger(entry.status) ? entry.status : 200;
    return new global.Response(responseBody(entry.body, headers), {status, statusText: entry.statusText || '', headers});
  };

  function createNetworkFixtures(routes = [], clock = {}) {
    // Keep these helpers inside the factory as well so the exact implementation
    // can be serialized into the opaque exercise realm by the DOM runner.
    const localPath = value => typeof value === 'string' && !/^(?:[a-z]+:|\/\/)/i.test(value) && !value.includes('\\') && !/(^|\/)\.\.(?:\/|$)/.test(value);
    const abortError = () => new global.DOMException('A requisição foi cancelada.', 'AbortError');
    const asMethod = value => String(value || 'GET').toUpperCase();
    const asUrl = input => typeof input === 'string' ? input : input?.url;
    const responseBody = (body, headers) => {
      if (body === undefined || body === null) return undefined;
      if (typeof body === 'string' || body instanceof global.Blob || body instanceof global.ArrayBuffer) return body;
      if (headers.get('content-type')?.includes('json')) return JSON.stringify(body);
      return String(body);
    };
    const responseFor = entry => {
      const headers = new global.Headers(entry.headers || {});
      if (entry.body !== undefined && !headers.has('content-type') && typeof entry.body !== 'string') headers.set('content-type', 'application/json');
      const status = Number.isInteger(entry.status) ? entry.status : 200;
      return new global.Response(responseBody(entry.body, headers), {status, statusText: entry.statusText || '', headers});
    };
    if (!Array.isArray(routes)) throw new Error('As rotas da fixture precisam ser uma lista.');
    const timer = {
      now: typeof clock.now === 'function' ? clock.now : () => Date.now(),
      set: typeof clock.setTimeout === 'function' ? clock.setTimeout.bind(clock) : global.setTimeout.bind(global),
      clear: typeof clock.clearTimeout === 'function' ? clock.clearTimeout.bind(clock) : global.clearTimeout.bind(global),
    };
    const normalized = routes.map((route, index) => {
      if (!route || !localPath(route.url)) throw new Error(`Rota local inválida: ${index}`);
      const sequence = Array.isArray(route.sequence) ? route.sequence : null;
      return { ...route, method: asMethod(route.method), url: route.url, sequence, cursor: 0 };
    });
    const requests = [];
    const pending = new Set();
    let disposed = false;
    function routeFor(method, url) {
      return normalized.find(route => route.method === method && route.url === url);
    }
    function fetchFixture(input, init = {}) {
      const url = asUrl(input);
      const method = asMethod(init.method || input?.method);
      const route = routeFor(method, url);
      if (!route || disposed || !localPath(url)) return Promise.reject(new Error(`Nenhuma rota fixture local para ${method} ${url}`));
      const signal = init.signal;
      const request = {method, url, at: timer.now(), status: null, delivered: false, aborted: false};
      requests.push(request);
      if (signal?.aborted) { request.aborted = true; return Promise.reject(abortError()); }
      const source = route.sequence ? (route.sequence[Math.min(route.cursor++, route.sequence.length - 1)] || {}) : route;
      const entry = {...route, ...source};
      const delay = Math.max(0, Number(entry.delay) || 0);
      return new Promise((resolve, reject) => {
        let settled = false;
        let timerId;
        let lateAfterAbort = false;
        const cleanup = () => {
          pending.delete(cancel);
          signal?.removeEventListener?.('abort', onAbort);
          if (timerId !== undefined) timer.clear(timerId);
        };
        const finishAbort = () => {
          if (settled) return;
          settled = true;
          request.aborted = true;
          if (entry.ignoreAbort) {
            settled = false;
            signal?.removeEventListener?.('abort', onAbort);
            return;
          }
          lateAfterAbort = Boolean(entry.lateAfterAbort);
          if (lateAfterAbort) {
            signal?.removeEventListener?.('abort', onAbort);
          } else cleanup();
          reject(abortError());
        };
        const onAbort = finishAbort;
        const deliver = () => {
          if (disposed || (settled && !lateAfterAbort)) return;
          if (lateAfterAbort) {
            lateAfterAbort = false;
            pending.delete(cancel);
            request.status = Number.isInteger(entry.status) ? entry.status : 200;
            request.delivered = true;
            if (timerId !== undefined) timer.clear(timerId);
            return;
          }
          settled = true;
          cleanup();
          const response = responseFor(entry);
          request.status = response.status;
          request.delivered = true;
          resolve(response);
        };
        const cancel = () => { settled = true; cleanup(); reject(new Error('Fixture encerrada.')); };
        pending.add(cancel);
        signal?.addEventListener?.('abort', onAbort, {once: true});
        if (signal?.aborted) { finishAbort(); return; }
        if (delay === 0) Promise.resolve().then(deliver);
        else timerId = timer.set(deliver, delay);
      });
    }
    function reset() {
      for (const cancel of [...pending]) cancel();
      pending.clear();
      requests.length = 0;
      for (const route of normalized) route.cursor = 0;
      disposed = false;
    }
    function dispose() {
      disposed = true;
      for (const cancel of [...pending]) cancel();
      pending.clear();
    }
    return Object.freeze({fetch: fetchFixture, reset, dispose, requests});
  }

  global.DevPathNetwork = Object.freeze({createNetworkFixtures, source: `(function(global){return (${createNetworkFixtures.toString()});})(globalThis)`});
})(window);
