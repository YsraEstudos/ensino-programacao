(function (global) {
  'use strict';

  function createTestRuntime(options = {}) {
    const target = options.target || (typeof globalThis !== 'undefined' ? globalThis : global);
    const clock = options.clock || null;
    const network = options.network || null;
    const registry = [];
    const scopes = [];
    const roots = [];
    const spies = new Set();
    const originalGlobals = new Map();
    const timerState = {fake: false, now: 0, nextId: 1, timers: new Map(), originals: null};
    const unhandled = [];
    const caseRecords = new Map();
    for (const record of (Array.isArray(options.caseRecords) ? options.caseRecords : []).filter(record => record && typeof record.id === 'string')) {
      if (!caseRecords.has(record.id)) caseRecords.set(record.id, []);
      caseRecords.get(record.id).push(record);
    }
    const capturedInputs = new Map();
    let firstFailure = null;
    let activeTestName = '';
    let installed = false;
    let installedScope = null;
    let unhandledListener = null;

    const show = value => {
      if (typeof value === 'string') return value;
      try { return JSON.stringify(value) ?? String(value); } catch { return String(value); }
    };
    const same = (a, b) => {
      if (Object.is(a, b)) return true;
      if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
      if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
      if (a instanceof Date) return a.getTime() === b.getTime();
      if (a instanceof RegExp) return String(a) === String(b);
      if (a instanceof Map) return a.size === b.size && [...a].every(([key, value]) => b.has(key) && same(value, b.get(key)));
      if (a instanceof Set) return a.size === b.size && [...a].every(value => b.has(value));
      const keys = Reflect.ownKeys(a);
      return keys.length === Reflect.ownKeys(b).length && keys.every(key => Object.prototype.hasOwnProperty.call(b, key) && same(a[key], b[key]));
    };
    const safeValue = (value, depth = 0, seen = new Set()) => {
      if (value === undefined) return {type: 'undefined'};
      if (value === null || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) return value;
      if (typeof value === 'number') return {type: 'number', value: String(value)};
      if (typeof value === 'string') return value.length > 240 ? `${value.slice(0, 237)}...` : value;
      if (typeof value === 'bigint') return {type: 'bigint', value: String(value).slice(0, 80)};
      if (typeof value === 'function') return {type: 'function', name: String(value.name || '').slice(0, 80)};
      if (typeof value === 'symbol') return {type: 'symbol', value: String(value).slice(0, 80)};
      if (value instanceof Error || (value && typeof value === 'object' && typeof value.message === 'string' && /Error$/.test(String(value.name || '')))) return {type: 'error', name: String(value.name || 'Error').slice(0, 80), message: String(value.message || '').slice(0, 200)};
      if (value?.nodeType === 1) return {type: 'DOM', tagName: String(value.tagName || '').slice(0, 40)};
      if (depth >= 3) return {type: 'object', truncated: true};
      if (seen.has(value)) return {type: 'circular'};
      seen.add(value);
      if (Array.isArray(value)) return value.slice(0, 8).map(item => safeValue(item, depth + 1, seen));
      const out = {};
      for (const key of Object.keys(value).sort().slice(0, 8)) {
        try { out[key.slice(0, 60)] = safeValue(value[key], depth + 1, seen); } catch { out[key.slice(0, 60)] = {type: 'unavailable'}; }
      }
      if (Object.keys(value).length > 8) out.truncated = true;
      return out;
    };
    const recordFailure = (context, matcher, negate, expected, observed) => {
      if (firstFailure || !context?.record) return;
      const record = context.record;
      firstFailure = {
        caseId: record.id,
        ...(activeTestName ? {testName: activeTestName.slice(0, 160)} : {}),
        matcher: `${context?.prefix || ''}${matcher}`,
        negated: Boolean(negate),
        ...(typeof record.inputExpression === 'string' ? {inputExpression: record.inputExpression.slice(0, 320)} : {}),
        ...(context.inputRuntime !== undefined ? {inputRuntime: context.inputRuntime} : {}),
        expected: safeValue(expected),
        observed: safeValue(observed),
        contractRule: String(record.contractRule || record.assertionExpression || '').slice(0, 360),
        investigation: String(record.investigation || '').slice(0, 360),
        sourceTestPath: String(record.sourceTestPath || '').slice(0, 160),
      };
    };
    const assertionError = message => { const error = new Error(message); error.name = 'AssertionError'; throw error; };
    const check = (ok, negate, expectation, received, context, matcher, expected) => {
      if (ok === negate) { recordFailure(context, matcher, negate, expected, received); assertionError(`esperado${negate ? ' que não' : ''} ${expectation}; recebido ${show(received)}`); }
    };
    const matchesThrown = (error, expected) => expected === undefined || (typeof expected === 'function' ? error instanceof expected : expected instanceof RegExp ? expected.test(error?.message || '') : String(error?.message || '').includes(String(expected)));
    const matcherSet = (received, negate, asynchronous = false, context = null) => {
      const make = (name, fn) => (...args) => {
        if (asynchronous) return Promise.resolve(received).then(value => fn(value, ...args), error => {
          recordFailure(context, name, false, 'promise resolvida', error);
          assertionError(`esperado promise resolvida; rejeitou ${error?.name || error}`);
        });
        return fn(received, ...args);
      };
      const matchers = {
        toBe: make('toBe', (value, expected) => check(Object.is(value, expected), negate, `${show(expected)} (mesmo valor)`, value, context, 'toBe', expected)),
        toEqual: make('toEqual', (value, expected) => check(same(value, expected), negate, show(expected), value, context, 'toEqual', expected)),
        toStrictEqual: make('toStrictEqual', (value, expected) => check(same(value, expected), negate, show(expected), value, context, 'toStrictEqual', expected)),
        toBeTruthy: make('toBeTruthy', value => check(Boolean(value), negate, 'um valor verdadeiro', value, context, 'toBeTruthy', true)),
        toBeFalsy: make('toBeFalsy', value => check(!value, negate, 'um valor falso', value, context, 'toBeFalsy', false)),
        toBeNull: make('toBeNull', value => check(value === null, negate, 'null', value, context, 'toBeNull', null)),
        toBeUndefined: make('toBeUndefined', value => check(value === undefined, negate, 'undefined', value, context, 'toBeUndefined', undefined)),
        toBeInstanceOf: make('toBeInstanceOf', (value, expected) => check(value instanceof expected, negate, `instância de ${expected.name}`, value, context, 'toBeInstanceOf', expected)),
        toContain: make('toContain', (value, expected) => check(value?.includes?.(expected) === true, negate, `conter ${show(expected)}`, value, context, 'toContain', expected)),
        toHaveLength: make('toHaveLength', (value, expected) => check(value?.length === expected, negate, `comprimento ${expected}`, value, context, 'toHaveLength', expected)),
        toBeGreaterThan: make('toBeGreaterThan', (value, expected) => check(value > expected, negate, `maior que ${expected}`, value, context, 'toBeGreaterThan', expected)),
        toBeLessThan: make('toBeLessThan', (value, expected) => check(value < expected, negate, `menor que ${expected}`, value, context, 'toBeLessThan', expected)),
        toBeCloseTo: make('toBeCloseTo', (value, expected, digits = 2) => check(Math.abs(value - expected) < 10 ** -digits / 2, negate, `próximo de ${expected}`, value, context, 'toBeCloseTo', expected)),
        toThrow: make('toThrow', (value, expected) => {
          if (typeof value !== 'function') assertionError('toThrow exige uma função.');
          let thrown; try { value(); } catch (error) { thrown = error; }
          const did = thrown !== undefined;
          const matches = did && matchesThrown(thrown, expected);
          if (matches === negate) { recordFailure(context, 'toThrow', negate, expected, did ? thrown : {type: 'no-throw'}); assertionError(`esperado${negate ? ' que não' : ''} lançar ${expected?.name || expected || 'um erro'}; ${did ? `lançou ${thrown?.name}: ${thrown?.message}` : 'nada foi lançado'}`); }
        }),
        toHaveBeenCalled: make('toHaveBeenCalled', value => check(Array.isArray(value?.mock?.calls) && value.mock.calls.length > 0, negate, 'ter sido chamada', value, context, 'toHaveBeenCalled', true)),
        toHaveBeenCalledTimes: make('toHaveBeenCalledTimes', (value, expected) => check(value?.mock?.calls?.length === expected, negate, `ser chamada ${expected} vezes`, value, context, 'toHaveBeenCalledTimes', expected)),
        toHaveBeenCalledWith: make('toHaveBeenCalledWith', (value, ...expected) => check(value?.mock?.calls?.some(call => same(call, expected)) === true, negate, `ser chamada com ${show(expected)}`, value, context, 'toHaveBeenCalledWith', expected)),
      };
      return matchers;
    };
    function expect(received, context = null) {
      const value = {...matcherSet(received, false, false, context), not: matcherSet(received, true, false, context)};
      if (received && typeof received.then === 'function') {
        const resolvesContext = context ? {...context, prefix: 'resolves.'} : null;
        const rejectsContext = context ? {...context, prefix: 'rejects.'} : null;
        value.resolves = {...matcherSet(received, false, true, resolvesContext), not: matcherSet(received, true, true, resolvesContext)};
        value.rejects = {};
        for (const name of Object.keys(matcherSet(undefined, false))) {
          value.rejects[name] = (...args) => Promise.resolve(received).then(value => {
            recordFailure(rejectsContext, name, false, 'promise rejeitada', {type: 'resolved', value});
            assertionError('esperava rejeição, mas a promise resolveu.');
          }, error => {
            if (name === 'toThrow') {
              if (!matchesThrown(error, args[0])) { recordFailure(rejectsContext, 'toThrow', false, args[0], error); assertionError(`esperado rejeitar com ${args[0]?.name || args[0] || 'um erro'}; recebido ${error?.name || error}`); }
              return undefined;
            }
            return matcherSet(error, false, false, rejectsContext)[name](...args);
          });
        }
        value.rejects.not = {};
        for (const name of Object.keys(matcherSet(undefined, true))) {
          value.rejects.not[name] = (...args) => Promise.resolve(received).then(value => {
            recordFailure(rejectsContext, name, true, 'promise rejeitada', {type: 'resolved', value});
            assertionError('esperava rejeição, mas a promise resolveu.');
          }, error => matcherSet(error, true, false, rejectsContext)[name](...args));
        }
      }
      return value;
    }
    function expectForCase(caseId, received, occurrence) {
      const records = caseRecords.get(caseId);
      const record = records?.[Number.isInteger(occurrence) ? occurrence : 0];
      const inputRuntime = capturedInputs.get(caseId);
      capturedInputs.delete(caseId);
      return expect(received, record ? {record, inputRuntime} : null);
    }
    function captureInput(caseId, input, callback) {
      if (typeof callback !== 'function') throw new TypeError('A captura de entrada exige uma função.');
      capturedInputs.set(caseId, safeValue(input));
      return callback();
    }
    function currentHooks() { return roots.filter(value => typeof value === 'function').concat(scopes.flatMap(scope => scope.before)); }
    function describe(name, body) {
      const scope = {name: String(name), before: []};
      scopes.push(scope);
      try { body?.(); } finally { scopes.pop(); }
    }
    function register(name, body) { registry.push({name: [...scopes.map(scope => scope.name), String(name)].join(' › '), body, hooks: currentHooks().slice(), after: scopes.flatMap(scope => scope.after || []).concat(roots.filter(value => value && typeof value === 'object').map(value => value.after)).filter(Boolean)}); }
    function beforeEach(fn) { if (!scopes.length) roots.push(fn); else scopes[scopes.length - 1].before.push(fn); }
    function afterEach(fn) { if (!scopes.length) roots.push({after: fn}); else scopes[scopes.length - 1].after = [...(scopes[scopes.length - 1].after || []), fn]; }
    function recordUnhandled(reason) { unhandled.push(reason instanceof Error ? reason : new Error(String(reason))); }
    function makeMock(implementation) {
      let impl = implementation;
      const fn = function (...args) {
        fn.mock.calls.push(args);
        try { const value = impl ? impl.apply(this, args) : undefined; fn.mock.results.push({type: 'return', value}); return value; }
        catch (error) { fn.mock.results.push({type: 'throw', value: error}); throw error; }
      };
      fn.mock = {calls: [], results: []};
      fn.mockClear = () => { fn.mock.calls.length = 0; fn.mock.results.length = 0; return fn; };
      fn.mockReset = () => { impl = undefined; return fn.mockClear(); };
      fn.mockImplementation = value => { impl = value; return fn; };
      fn.mockReturnValue = value => fn.mockImplementation(() => value);
      fn.mockResolvedValue = value => fn.mockImplementation(() => Promise.resolve(value));
      fn.mockRejectedValue = value => fn.mockImplementation(() => Promise.reject(value));
      return fn;
    }
    const vi = {
      fn: makeMock,
      spyOn(object, key) {
        const original = object[key];
        const spy = makeMock(function (...args) { return original.apply(this, args); });
        object[key] = spy;
        spy.mockRestore = () => { object[key] = original; spies.delete(spy); };
        spies.add(spy);
        return spy;
      },
      restoreAllMocks() { for (const spy of [...spies]) spy.mockRestore?.(); spies.clear(); },
      clearAllMocks() { for (const spy of spies) spy.mockClear?.(); },
      useFakeTimers() {
        if (timerState.fake) return vi;
        timerState.fake = true; timerState.now = Number(clock?.now?.() ?? Date.now());
        timerState.originals = {setTimeout: target.setTimeout, clearTimeout: target.clearTimeout, setInterval: target.setInterval, clearInterval: target.clearInterval, Date: target.Date};
        target.setTimeout = (callback, delay = 0, ...args) => { const id = timerState.nextId++; timerState.timers.set(id, {callback, args, due: timerState.now + Math.max(0, Number(delay)), interval: 0}); return id; };
        target.clearTimeout = id => timerState.timers.delete(id);
        target.setInterval = (callback, delay = 0, ...args) => { const id = timerState.nextId++; const interval = Math.max(1, Number(delay)); timerState.timers.set(id, {callback, args, due: timerState.now + interval, interval}); return id; };
        target.clearInterval = id => timerState.timers.delete(id);
        const OriginalDate = timerState.originals.Date || Date;
        target.Date = class FakeDate extends OriginalDate { constructor(...args) { super(...(args.length ? args : [timerState.now])); } static now() { return timerState.now; } };
        return vi;
      },
      advanceTimersByTime(ms) {
        if (!timerState.fake) throw new Error('Use vi.useFakeTimers() antes de avançar o relógio.');
        const end = timerState.now + Math.max(0, Number(ms));
        while (true) {
          const next = [...timerState.timers.entries()].sort((a, b) => a[1].due - b[1].due)[0];
          if (!next || next[1].due > end) break;
          const [id, timer] = next; timerState.now = timer.due;
          if (timer.interval) timer.due += timer.interval; else timerState.timers.delete(id);
          timer.callback(...timer.args);
        }
        timerState.now = end;
      },
      runAllTimers() { let guard = 10000; while (timerState.timers.size && guard-- > 0) vi.advanceTimersByTime(Math.max(0, Math.min(...[...timerState.timers.values()].map(timer => timer.due - timerState.now)))); },
      getTimerCount() { return timerState.timers.size; },
      useRealTimers() { restoreTimers(); return vi; },
    };
    function restoreTimers() {
      if (!timerState.fake) return;
      Object.assign(target, timerState.originals); timerState.timers.clear(); timerState.fake = false; timerState.originals = null;
    }
    function install(scope = target) {
      if (installed) restore(installedScope || scope);
      const values = {describe, test: register, it: register, beforeEach, afterEach, expect, __devpathExpect: expectForCase, __devpathCaptureInput: captureInput, vi};
      for (const [key, value] of Object.entries(values)) { if (!originalGlobals.has(key)) originalGlobals.set(key, scope[key]); scope[key] = value; }
      if (network && network.fetch && !originalGlobals.has('fetch')) { originalGlobals.set('fetch', scope.fetch); scope.fetch = network.fetch; }
      unhandledListener = event => recordUnhandled(event.reason);
      installedScope = scope;
      if (scope.addEventListener) scope.addEventListener('unhandledrejection', unhandledListener);
      installed = true; return () => restore(scope);
    }
    async function run() {
      let passed = 0;
      const lines = [];
      for (const entry of registry) {
        let bodyPassed = false;
        let afterFailed = false;
        activeTestName = entry.name;
        try {
          for (const hook of entry.hooks) await hook();
          await entry.body(); bodyPassed = true;
        } catch (error) { lines.push(`✗ ${entry.name}\n    ${error?.message || String(error)}`); }
        finally {
          for (const hook of [...(entry.after || [])].reverse()) {
            try { await hook(); }
            catch (error) { afterFailed = true; lines.push(`✗ ${entry.name} (afterEach)\n    ${error?.message || String(error)}`); }
          }
          if (bodyPassed && !afterFailed) { passed++; lines.push(`✓ ${entry.name}`); }
        }
        activeTestName = '';
      }
      // The browser queues unhandledrejection as a host task. Drain a bounded
      // checkpoint protocol so the result cannot win the race with that event,
      // without sleeping for an arbitrary wall-clock duration.
      const waitTurn = timerState.originals?.setTimeout || target.setTimeout;
      for (let checkpoint = 0; checkpoint < 4 && !unhandled.length; checkpoint++) {
        if (typeof waitTurn === 'function') await new Promise(resolve => waitTurn(resolve, 0));
        else await Promise.resolve();
      }
      if (unhandled.length) throw unhandled.shift();
      return {passed, failed: registry.length - passed, total: registry.length, text: lines.join('\n'), ...(firstFailure ? {firstFailure} : {})};
    }
    function restore(scope = target) {
      vi.restoreAllMocks(); restoreTimers();
      if (unhandledListener && (installedScope?.removeEventListener || scope.removeEventListener)) {
        (installedScope || scope).removeEventListener?.('unhandledrejection', unhandledListener);
      }
      if (installed) for (const [key, value] of originalGlobals) { if (value === undefined) { try { delete scope[key]; } catch {} } else scope[key] = value; }
      originalGlobals.clear(); installed = false; installedScope = null; unhandledListener = null; registry.length = 0; scopes.length = 0; roots.length = 0; unhandled.length = 0; capturedInputs.clear(); firstFailure = null; activeTestName = '';
    }
    return Object.freeze({describe, test: register, it: register, beforeEach, afterEach, expect, vi, install, run, restore, recordUnhandled, get unhandledRejections() { return unhandled.slice(); }});
  }

  // The DOM runner evaluates the same self-contained factory inside its opaque iframe.
  global.DevPathTestRuntime = Object.freeze({createTestRuntime, source: createTestRuntime.toString()});
})(typeof globalThis !== 'undefined' ? globalThis : window);
