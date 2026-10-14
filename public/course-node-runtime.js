(function (global) {
  'use strict';

  const MODULE_EXPORTS = Object.freeze({
    'node:fs/promises': ['readFile', 'writeFile', 'default'],
    'node:path': ['join', 'resolve', 'dirname', 'basename', 'extname', 'default'],
    'node:url': ['pathToFileURL', 'fileURLToPath', 'default'],
    'node:test': ['describe', 'test', 'it', 'beforeEach', 'afterEach', 'expect', 'vi', 'default'],
    'node:assert/strict': ['ok', 'equal', 'notEqual', 'strictEqual', 'notStrictEqual', 'deepEqual', 'deepStrictEqual', 'notDeepEqual', 'notDeepStrictEqual', 'throws', 'rejects', 'match', 'doesNotMatch', 'default'],
  });
  const MODULE_NAMES = Object.freeze(Object.keys(MODULE_EXPORTS));

  function safePath(value, base = '', cwd = '') {
    if (typeof value !== 'string' || value.includes('\\') || value.includes('\0') || /^[a-z]+:/i.test(value) || value.startsWith('/')) {
      if (typeof value === 'string' && value.startsWith('/') && base === 'absolute') return value;
      throw new Error('Use caminhos locais dos arquivos do exercício.');
    }
    const parts = (base ? base.split('/') : cwd.split('/')).filter(Boolean);
    for (const part of value.split('/')) {
      if (!part || part === '.') continue;
      if (part === '..') {
        if (!parts.length) throw new Error('O caminho sai da raiz virtual do exercício.');
        parts.pop();
      } else parts.push(part);
    }
    return parts.join('/');
  }

  function errorWithCode(code, message) {
    const error = new Error(message);
    error.code = code;
    return error;
  }
  function unsupportedError(message) {
    return errorWithCode('UNSUPPORTED', message);
  }

  function deepEqualValue(a, b) {
    if (Object.is(a, b)) return true;
    if (typeof a !== typeof b || a === null || b === null) return false;
    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
    if (a instanceof RegExp || b instanceof RegExp) return a instanceof RegExp && b instanceof RegExp && String(a) === String(b);
    if (a instanceof Date || b instanceof Date) return a instanceof Date && b instanceof Date && Object.is(a.getTime(), b.getTime());
    const aIsError = Object.prototype.toString.call(a) === '[object Error]';
    const bIsError = Object.prototype.toString.call(b) === '[object Error]';
    if (aIsError || bIsError) {
      const aKeys = Reflect.ownKeys(a).filter(key => key !== 'stack' && key !== 'message');
      const bKeys = Reflect.ownKeys(b).filter(key => key !== 'stack' && key !== 'message');
      return aIsError && bIsError && a.name === b.name && a.message === b.message && aKeys.length === bKeys.length && aKeys.every(key => Object.prototype.hasOwnProperty.call(b, key) && deepEqualValue(a[key], b[key]));
    }
    if (a instanceof Map || b instanceof Map) return a instanceof Map && b instanceof Map && a.size === b.size && [...a].every(([key, value]) => [...b].some(([otherKey, otherValue]) => deepEqualValue(key, otherKey) && deepEqualValue(value, otherValue)));
    if (a instanceof Set || b instanceof Set) return a instanceof Set && b instanceof Set && a.size === b.size && [...a].every(value => [...b].some(other => deepEqualValue(value, other)));
    if (typeof a !== 'object') return false;
    const aKeys = Reflect.ownKeys(a); const bKeys = Reflect.ownKeys(b);
    return aKeys.length === bKeys.length && aKeys.every(key => Object.prototype.hasOwnProperty.call(b, key) && deepEqualValue(a[key], b[key]));
  }

  function matchesError(error, expected) {
    if (!expected) return true;
    if (typeof expected === 'function') return error instanceof expected;
    if (typeof expected?.test === 'function') return expected.test(String(error?.message || error));
    if (typeof expected === 'object') {
      const isErrorValue = value => value && Object.prototype.toString.call(value) === '[object Error]';
      if (expected instanceof Error || isErrorValue(expected)) {
        if (!isErrorValue(error) || expected.name !== error.name || expected.message !== error.message) return false;
        return Reflect.ownKeys(expected).filter(key => key !== 'stack' && key !== 'message').every(key => Object.prototype.hasOwnProperty.call(error, key) && deepEqualValue(error[key], expected[key]));
      }
      return Reflect.ownKeys(expected).every(key => deepEqualValue(error?.[key], expected[key]));
    }
    return String(error?.message || error).includes(String(expected));
  }

  function createFallbackTests() {
    const tests = [];
    const scopes = [];
    const hooks = {before: [], after: []};
    const register = (name, body) => tests.push({name: [...scopes, String(name)].join(' › '), body, before: [...hooks.before], after: [...hooks.after]});
    const describe = (name, body) => { scopes.push(String(name)); try { body?.(); } finally { scopes.pop(); } };
    const assert = (ok, message) => { if (!ok) throw new Error(message || 'Assertion failed'); };
    const same = deepEqualValue;
    const expect = value => ({
      toBe: expected => assert(Object.is(value, expected), `Expected ${String(value)} to be ${String(expected)}`),
      toEqual: expected => assert(same(value, expected), 'Expected values to be equal'),
      toBeTruthy: () => assert(Boolean(value), 'Expected a truthy value'),
      toBeFalsy: () => assert(!value, 'Expected a falsy value'),
      toBeDefined: () => assert(value !== undefined, 'Expected a defined value'),
      toBeUndefined: () => assert(value === undefined, 'Expected undefined'),
      toThrow: expected => { let thrown; try { value(); } catch (error) { thrown = error; } assert(thrown && (!expected || String(thrown.message).includes(String(expected)))); },
    });
    const run = async () => {
      let passed = 0; let failed = 0;
      for (const entry of tests) {
        try { for (const hook of entry.before) await hook(); await entry.body(); for (const hook of entry.after) await hook(); passed++; }
        catch { failed++; }
      }
      return {passed, failed, total: tests.length};
    };
    return {describe, test: register, it: register, beforeEach(fn) { hooks.before.push(fn); }, afterEach(fn) { hooks.after.push(fn); }, expect, vi: {fn: implementation => (...args) => implementation?.(...args)}, run};
  }

  function createNodeRuntime(options = {}) {
    const sourceFiles = Array.isArray(options.files) ? options.files : [];
    const virtualCwd = String(options.virtualCwd || '').replaceAll('\\', '/').replace(/^\/+|\/+$/g, '');
    const initialFiles = new Map();
    for (const file of sourceFiles) {
      if (!file || typeof file.path !== 'string' || typeof file.content !== 'string') throw new Error('Arquivo virtual inválido.');
      const path = safePath(file.path, '', virtualCwd);
      if (initialFiles.has(path)) throw new Error(`Arquivo duplicado: ${path}`);
      initialFiles.set(path, String(file.content));
    }
    const initialArgv = Array.isArray(options.argv) ? options.argv.map(String) : ['node-simulated'];
    const initialEnv = Object.fromEntries(Object.entries(options.env || {}).map(([key, value]) => [String(key), String(value)]));
    const clock = options.clock || {};
    const now = () => typeof clock.now === 'function' ? Number(clock.now()) : 0;
    const setClockTimeout = typeof clock.setTimeout === 'function' ? clock.setTimeout.bind(clock) : setTimeout;
    const clearClockTimeout = typeof clock.clearTimeout === 'function' ? clock.clearTimeout.bind(clock) : clearTimeout;
    const state = {files: new Map(), argv: [], env: {}, stdout: '', stderr: '', exitCode: 0, timers: new Set(), nextTicks: [], testRuntime: null};
    const cloneFiles = () => new Map(initialFiles);
    const toRelative = (value, base = '') => {
      if (value instanceof URL) return fromVirtualUrl(value);
      if (typeof value === 'string' && /^[a-z]+:/i.test(value)) return fromVirtualUrl(value);
      return safePath(String(value), '', base || virtualCwd);
    };
    const fromVirtualUrl = value => {
      const url = value instanceof URL ? value : new URL(String(value));
      if (url.protocol !== 'virtual:') throw new Error('A URL deve apontar para o filesystem virtual.');
      const pathname = decodeURIComponent(url.pathname).replace(/^\/+/, '');
      const prefix = virtualCwd ? `${virtualCwd}/` : '';
      return safePath(pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname, '', virtualCwd);
    };
    const toVirtualUrl = value => `virtual:///${toRelative(value).replaceAll(' ', '%20')}`;
    const fileApi = {
      async readFile(file, encoding) {
        const path = toRelative(file);
        if (!state.files.has(path)) throw errorWithCode('ENOENT', `No such virtual file: ${path}`);
        const content = String(state.files.get(path));
        return encoding ? content : new TextEncoder().encode(content);
      },
      async writeFile(file, content) {
        const path = toRelative(file);
        if (!path) throw errorWithCode('EINVAL', 'Cannot write the virtual root.');
        state.files.set(path, typeof content === 'string' ? content : new TextDecoder().decode(content));
      },
    };
    const pathApi = {
      join: (...parts) => parts.reduce((current, part) => safePath(String(part), '', current), ''),
      resolve: (...parts) => safePath(parts.filter(Boolean).join('/'), '', virtualCwd),
      dirname: value => { const path = toRelative(value); const index = path.lastIndexOf('/'); return index < 0 ? '.' : path.slice(0, index) || '.'; },
      basename: value => toRelative(value).split('/').pop() || '',
      extname: value => { const base = toRelative(value).split('/').pop() || ''; const index = base.lastIndexOf('.'); return index > 0 ? base.slice(index) : ''; },
    };
    const urlApi = {
      pathToFileURL: value => toVirtualUrl(value),
      fileURLToPath: value => fromVirtualUrl(value),
    };
    const processApi = {};
    Object.defineProperties(processApi, {
      argv: {enumerable: true, get: () => Object.freeze(state.argv.slice())},
      env: {enumerable: true, get: () => Object.freeze({...state.env})},
      exitCode: {enumerable: true, get: () => state.exitCode, set: value => { state.exitCode = Number(value) || 0; }},
      stdout: {enumerable: true, value: Object.freeze({write(value) { state.stdout += String(value); return true; }})},
      stderr: {enumerable: true, value: Object.freeze({write(value) { state.stderr += String(value); return true; }})},
      stdoutText: {enumerable: true, get: () => state.stdout},
      stderrText: {enumerable: true, get: () => state.stderr},
      cwd: {enumerable: true, value: () => virtualCwd ? `/${virtualCwd}` : '/'},
      nextTick: {enumerable: true, value: (fn, ...args) => { const id = setClockTimeout(() => { state.timers.delete(id); fn(...args); }, 0); state.timers.add(id); }},
      uptime: {enumerable: true, value: () => now() / 1000},
    });
    const testApi = () => {
      if (state.testRuntime) return state.testRuntime;
      const installed = ['describe', 'test', 'it', 'beforeEach', 'afterEach', 'expect', 'vi'].every(name => typeof globalThis[name] === 'function' || (name === 'vi' && globalThis.vi));
      if (installed) return (state.testRuntime = Object.fromEntries(['describe', 'test', 'it', 'beforeEach', 'afterEach', 'expect', 'vi'].map(name => [name, globalThis[name]])));
      return (state.testRuntime = globalThis.DevPathTestRuntime?.createTestRuntime?.() || createFallbackTests());
    };
    const assertApi = {
      ok(value, message) { if (!value) throw new Error(message || 'Expected a truthy value.'); },
      equal(a, b, message) { if (!Object.is(a, b)) throw new Error(message || `Expected ${String(a)} === ${String(b)}.`); },
      notEqual(a, b, message) { if (Object.is(a, b)) throw new Error(message || 'Values should differ.'); },
      strictEqual(a, b, message) { if (!Object.is(a, b)) throw new Error(message || 'Values should be strictly equal.'); },
      notStrictEqual(a, b, message) { if (Object.is(a, b)) throw new Error(message || 'Values should differ.'); },
      deepEqual(a, b, message) { if (!deepEqualValue(a, b)) throw new Error(message || 'Values should be deeply equal.'); },
      deepStrictEqual(a, b, message) { if (!deepEqualValue(a, b)) throw new Error(message || 'Values should be deeply equal.'); },
      notDeepEqual(a, b, message) { if (deepEqualValue(a, b)) throw new Error(message || 'Values should differ.'); },
      notDeepStrictEqual(a, b, message) { if (deepEqualValue(a, b)) throw new Error(message || 'Values should differ.'); },
      match(value, pattern, message) { if (!(typeof pattern?.test === 'function' ? pattern.test(String(value)) : String(value).includes(String(pattern)))) throw new Error(message || 'Value does not match.'); },
      doesNotMatch(value, pattern, message) { if (typeof pattern?.test === 'function' ? pattern.test(String(value)) : String(value).includes(String(pattern))) throw new Error(message || 'Value unexpectedly matches.'); },
      throws(fn, expected) { let thrown; try { fn(); } catch (error) { thrown = error; } if (!thrown || !matchesError(thrown, expected)) throw new Error('Expected function to throw.'); },
      async rejects(fn, expected) { let thrown; try { await (typeof fn === 'function' ? fn() : fn); } catch (error) { thrown = error; } if (!thrown || !matchesError(thrown, expected)) throw new Error('Expected promise to reject.'); },
    };
    const moduleApi = {
      'node:fs/promises': Object.freeze({...fileApi}),
      'node:path': Object.freeze({...pathApi}),
      'node:url': Object.freeze({...urlApi}),
      'node:test': Object.freeze({get describe() { return testApi().describe; }, get test() { return testApi().test; }, get it() { return testApi().it; }, get beforeEach() { return testApi().beforeEach; }, get afterEach() { return testApi().afterEach; }, get expect() { return testApi().expect; }, get vi() { return testApi().vi; }}),
      'node:assert/strict': Object.freeze(assertApi),
    };
    moduleApi['node:fs/promises'] = Object.freeze({...moduleApi['node:fs/promises'], default: moduleApi['node:fs/promises']});
    moduleApi['node:path'] = Object.freeze({...moduleApi['node:path'], default: moduleApi['node:path']});
    moduleApi['node:url'] = Object.freeze({...moduleApi['node:url'], default: moduleApi['node:url']});
    moduleApi['node:test'] = Object.freeze({...moduleApi['node:test'], get default() { return testApi().test; }});
    moduleApi['node:assert/strict'] = Object.freeze({...moduleApi['node:assert/strict'], default: moduleApi['node:assert/strict']});
    const moduleInfo = Object.freeze(Object.fromEntries(MODULE_NAMES.map(name => [name, Object.freeze({name, exports: Object.freeze([...MODULE_EXPORTS[name]]), ...moduleApi[name]})])));
    const reset = () => {
      for (const id of state.timers) clearClockTimeout(id);
      state.timers.clear(); state.files = cloneFiles(); state.argv = initialArgv.slice(); state.env = {...initialEnv}; state.stdout = ''; state.stderr = ''; state.exitCode = 0; state.nextTicks.length = 0; state.testRuntime?.reset?.(); state.testRuntime = null;
    };
    reset();
    const runtime = {modules: moduleInfo, process: Object.freeze(processApi), reset, readFileUrl: file => fileApi.readFile(file, 'utf8'), module(name) { if (!moduleApi[name]) throw unsupportedError(`Unsupported virtual module: ${name}`); return moduleApi[name]; }, virtualUrl: toVirtualUrl, capabilities: Object.freeze({label: 'Node simulado', modules: MODULE_NAMES, unsupported: ['node:child_process', 'node:worker_threads', 'node:net', 'node:tls', 'node:crypto', 'npm', 'git', 'require']})};
    return Object.freeze(runtime);
  }

  const source = `(function(){const MODULE_EXPORTS=${JSON.stringify(MODULE_EXPORTS)};const MODULE_NAMES=Object.freeze(Object.keys(MODULE_EXPORTS));const safePath=${safePath.toString()};const errorWithCode=${errorWithCode.toString()};const unsupportedError=${unsupportedError.toString()};const deepEqualValue=${deepEqualValue.toString()};const matchesError=${matchesError.toString()};const createFallbackTests=${createFallbackTests.toString()};return (${createNodeRuntime.toString()});})()`;
  global.DevPathNodeRuntime = Object.freeze({createNodeRuntime, modules: MODULE_EXPORTS, source});
})(typeof globalThis !== 'undefined' ? globalThis : window);
