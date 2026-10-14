(function (global) {
  'use strict';

  let compilerPromise;
  let compilerInstance;

  function loadCompiler() {
    if (compilerPromise) return compilerPromise;
    if (global.DevPathCompilerEngine) {
      compilerInstance = global.DevPathCompilerEngine;
      compilerPromise = Promise.resolve(compilerInstance);
      return compilerPromise;
    }
    const src = global.DevPathCompilerAssets?.script;
    if (typeof src !== 'string' || !src) return Promise.reject(new Error('Compiler indisponível.'));
    compilerPromise = new Promise((resolve, reject) => {
      const script = global.document.createElement('script');
      script.src = src;
      script.onload = () => {
        if (!global.DevPathCompilerEngine) { reject(new Error('Compiler não expôs o engine.')); return; }
        compilerInstance = global.DevPathCompilerEngine;
        resolve(compilerInstance);
      };
      script.onerror = () => reject(new Error('Não foi possível carregar o compiler.'));
      global.document.head.append(script);
    }).catch(error => {
      compilerPromise = null;
      throw error;
    });
    return compilerPromise;
  }

  async function prepare() {
    try { return typeof (await loadCompiler())?.parse === 'function'; }
    catch { return false; }
  }

  function strip(source) {
    if (typeof source !== 'string' || !source.includes('/*@case')) return source;
    const parse = compilerInstance?.parse || global.DevPathCompilerEngine?.parse;
    if (typeof parse !== 'function') return source;

    const comments = [];
    const tokens = [];
    try {
      parse(source, {
        ecmaVersion: 'latest',
        sourceType: 'module',
        onToken: tokens,
        onComment(block, value, start, end) {
          if (block && /^@case\s+[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value)) comments.push([start, end]);
        },
      });
    } catch {
      // Invalid or unsupported source keeps every byte in its fingerprint.
      return source;
    }

    if (!comments.length) return source;
    const originalTokens = tokens.filter(token => token.type.label !== 'eof')
      .map(token => `${token.type.label}:${source.slice(token.start, token.end)}`);
    const tokenize = candidate => {
      const parsedTokens = [];
      try {
        parse(candidate, {ecmaVersion: 'latest', sourceType: 'module', onToken: parsedTokens});
        return parsedTokens.filter(token => token.type.label !== 'eof')
          .map(token => `${token.type.label}:${candidate.slice(token.start, token.end)}`);
      } catch { return null; }
    };
    const editComments = replacementFor => {
      let candidate = source;
      for (const [start, end] of comments.reverse()) candidate = candidate.slice(0, start) + replacementFor(source.slice(start, end)) + candidate.slice(end);
      comments.reverse();
      return candidate;
    };
    const withoutMarkers = editComments(marker => marker.match(/[\r\n\u2028\u2029]/g)?.join('') || '');
    const strippedTokens = tokenize(withoutMarkers);
    if (strippedTokens && strippedTokens.length === originalTokens.length && strippedTokens.every((token, index) => token === originalTokens[index])) return withoutMarkers;

    const separated = editComments(marker => marker.match(/[\r\n\u2028\u2029]/g)?.join('') || ' ');
    const separatedTokens = tokenize(separated);
    return separatedTokens && separatedTokens.length === originalTokens.length && separatedTokens.every((token, index) => token === originalTokens[index])
      ? separated
      : source;
  }

  global.DevPathCompilerLoader = Object.freeze({load: loadCompiler});
  global.DevPathCaseMarkers = Object.freeze({prepare, strip});
})(window);
