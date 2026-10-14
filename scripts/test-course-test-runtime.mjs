import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import * as esbuild from 'esbuild-wasm';
import {parse} from 'acorn';
import {setup} from './course-runner-harness.mjs';

function factory(target = {}) {
  const context = {globalThis: target, window: target};
  vm.runInNewContext(readFileSync('public/course-test-runtime.js', 'utf8'), context);
  return context.globalThis.DevPathTestRuntime.createTestRuntime({target});
}

test('registers nested tests, beforeEach, matchers and rejects', async () => {
  const target = {};
  const runtime = factory(target);
  runtime.install(target);
  let count = 0;
  runtime.describe('suite', () => {
    runtime.beforeEach(() => { count++; });
    runtime.test('sync', () => runtime.expect({a: [1, NaN]}).toStrictEqual({a: [1, NaN]}));
    runtime.it('rejeita', async () => await runtime.expect(Promise.reject(new TypeError('bad'))).rejects.toThrow(TypeError));
  });
  const result = await runtime.run();
  assert.deepEqual({passed: result.passed, failed: result.failed, total: result.total}, {passed: 2, failed: 0, total: 2});
  assert.equal(count, 2);
  runtime.restore();
});

test('duplicate case records select the requested annotated occurrence', async () => {
  const id = '21.04.lru-refresh-eviction';
  const target = {};
  const context = {globalThis: target, window: target};
  vm.runInNewContext(readFileSync('public/course-test-runtime.js', 'utf8'), context);
  const runtime = context.globalThis.DevPathTestRuntime.createTestRuntime({target, caseRecords: [
      {id, contractRule: 'first rule'},
      {id, contractRule: 'second rule'},
  ]});
  runtime.install(target);
  target.test('second context', () => target.__devpathExpect(id, 3, 1).toBe(4));
  const result = await runtime.run();
  assert.equal(result.firstFailure.caseId, id);
  assert.equal(result.firstFailure.contractRule, 'second rule');
  runtime.restore(target);
});

test('vi.fn and spyOn record calls and restore the original', async () => {
  const target = {};
  const runtime = factory(target);
  const fn = runtime.vi.fn(value => value * 2);
  assert.equal(fn(3), 6);
  runtime.expect(fn).toHaveBeenCalledWith(3);
  const object = {value(value) { return value + 1; }};
  const original = object.value;
  const spy = runtime.vi.spyOn(object, 'value');
  assert.equal(object.value(4), 5);
  runtime.expect(spy).toHaveBeenCalledTimes(1);
  runtime.restore();
  assert.equal(object.value, original);
});

test('fake timers advance deterministic callbacks and restore in finally', async () => {
  const target = {setTimeout, clearTimeout, setInterval, clearInterval, Date};
  const runtime = factory(target);
  runtime.install(target);
  const values = [];
  runtime.vi.useFakeTimers();
  target.setTimeout(() => values.push(Date.now()), 50);
  runtime.vi.advanceTimersByTime(49);
  assert.deepEqual(values, []);
  runtime.vi.advanceTimersByTime(1);
  assert.equal(values.length, 1);
  runtime.restore();
  assert.equal(target.setTimeout, setTimeout);
});

test('a rejected test fails while later tests continue and empty suites remain empty', async () => {
  const runtime = factory({});
  runtime.test('rejeita', async () => { throw new Error('async failure'); });
  runtime.test('continua', () => {});
  const result = await runtime.run();
  assert.deepEqual({passed: result.passed, failed: result.failed, total: result.total}, {passed: 1, failed: 1, total: 2});
  const empty = factory({});
  const emptyResult = await empty.run();
  assert.equal(emptyResult.passed, 0);
  assert.equal(emptyResult.failed, 0);
  assert.equal(emptyResult.total, 0);
});

test('afterEach failure marks only its own test and cleanup survives reuse', async () => {
  const target = {listeners: new Map(), addEventListener(name, callback) { this.listeners.set(callback, name); }, removeEventListener(name, callback) { this.listeners.delete(callback); }};
  const runtime = factory(target);
  runtime.install(target);
  let teardownCalls = 0;
  runtime.afterEach(() => { teardownCalls++; if (teardownCalls === 2) throw new Error('teardown'); });
  runtime.test('primeiro', () => {});
  runtime.test('segundo', () => { throw new Error('body'); });
  runtime.test('terceiro', () => {});
  const result = await runtime.run();
  assert.equal(result.passed, 2);
  assert.equal(result.failed, 1);
  assert.equal(target.listeners.size, 1);
  runtime.restore();
  assert.equal(target.listeners.size, 0);
  runtime.install(target);
  assert.equal(target.listeners.size, 1);
  runtime.restore();
  assert.equal(target.listeners.size, 0);
});

test('loose rejection is surfaced to the caller', async () => {
  const target = {listeners: {}, addEventListener(name, callback) { this.listeners[name] = callback; }};
  const runtime = factory(target);
  runtime.install(target);
  target.listeners.unhandledrejection({reason: new Error('unhandled')});
  await assert.rejects(runtime.run(), /unhandled/);
  runtime.restore();
});

test('student suites pass the correct implementation and kill every semantic mutant', async () => {
  const env = setup();
  try {
    const context = {TextEncoder, window: null};
    context.window = context;
    vm.runInThisContext('(function(window){' + readFileSync('public/module-graph.js', 'utf8') + '})')(context);
    const graphApi = context.DevPathModuleGraph;
    context.DevPathModuleGraph = {buildModuleGraph: input => graphApi.buildModuleGraph(input, {build: esbuild.build, parse, transform: esbuild.transform})};
    context.DevPathCourseRunner = {run(code, finish) { let stopped = false; env.run(code).then(result => { if (!stopped) finish(result.kind, result.text, result.tests); }); return () => { stopped = true; }; }};
    vm.runInNewContext(readFileSync('public/course-assessment.js', 'utf8'), context);
    const runSuite = input => context.DevPathAssessment.runStudentSuite({...input, assessment: {testPath: 'tests.js'}, fingerprint: 'runtime-fixture'});
    const pagination = await runSuite({
      files: [{path: 'tests.js', content: 'import {describe, it, expect} from "vitest"; import {paginar} from "./pagination.js"; import {cases} from "./helper.js"; describe("paginar",()=>{it("limite",()=>expect(paginar(...cases[0])).toEqual([1,2]));it("pagina2",()=>expect(paginar(...cases[1])).toEqual([3]));it("pagina0",()=>expect(paginar(...cases[2])).toEqual([1,2]));});'}, {path: 'helper.js', content: 'export const cases=[[[1,2,3],1,2],[[1,2,3],2,2],[[1,2,3],0,2]];'}],
      correctFiles: [{path: 'pagination.js', content: 'export function paginar(items,page,size){ const current=Math.max(1,page); const start=(current-1)*size; return items.slice(start, start+size); }'}],
      mutantDirs: [
        {id: 'skip-last', files: [{path: 'pagination.js', content: readFileSync('course-src/mutants/13.03/skip-last/pagination.js', 'utf8')}]},
        {id: 'negative-page', files: [{path: 'pagination.js', content: readFileSync('course-src/mutants/13.03/negative-page/pagination.js', 'utf8')}]}
      ]
    });
    assert.equal(pagination.kind, 'passed', pagination.text);
    const clamp = await runSuite({
      files: [{path: 'tests.js', content: 'import {it, expect} from "vitest"; import {clamp} from "./clamp.js"; it("limites",()=>{expect(clamp(5,0,4)).toBe(4);expect(clamp(-1,0,4)).toBe(0);});'}],
      correctFiles: [{path: 'clamp.js', content: 'export function clamp(value,minimum,maximum){ return Math.min(maximum, Math.max(minimum,value)); }'}],
      mutantDirs: [
        {id: 'exclusive-upper', files: [{path: 'clamp.js', content: readFileSync('course-src/mutants/13.07/exclusive-upper/clamp.js', 'utf8')}]},
        {id: 'ignore-minimum', files: [{path: 'clamp.js', content: readFileSync('course-src/mutants/13.07/ignore-minimum/clamp.js', 'utf8')}]}
      ]
    });
    assert.equal(clamp.kind, 'passed', clamp.text);
    const retry = await runSuite({
      files: [{path: 'tests.js', content: 'import {it, expect} from "vitest"; import {retry} from "./retry.js"; it("retry",async()=>{let calls=0;const value=await retry(async()=>{calls++;if(calls<3)throw new Error("temporary");return 7;},3);expect(value).toBe(7);expect(calls).toBe(3);});'}],
      correctFiles: [{path: 'retry.js', content: 'export async function retry(operation,attempts=3){let last;for(let i=0;i<attempts;i++){try{return await operation();}catch(error){last=error;}}throw last;}'}],
      mutantDirs: [
        {id: 'no-retry', files: [{path: 'retry.js', content: readFileSync('course-src/mutants/13.09/no-retry/retry.js', 'utf8')}]},
        {id: 'retry-off-by-one', files: [{path: 'retry.js', content: readFileSync('course-src/mutants/13.09/retry-off-by-one/retry.js', 'utf8')}]}
      ]
    });
    assert.equal(retry.kind, 'passed', retry.text);
    const multi = await context.DevPathAssessment.runStudentSuite({
      files: [
        {path: 'one.test.js', content: 'import {it,expect} from "vitest";it("one",()=>expect(true).toBe(true));'},
        {path: 'two.test.js', content: 'import {it,expect} from "vitest";import {value} from "./value.js";it("two",()=>expect(value+1).toBe(3));'}
      ],
      correctFiles: [{path: 'value.js', content: 'export const value=2;'}],
      mutantDirs: [{id: 'wrong', files: [{path: 'value.js', content: 'export const value=4;'}]}],
      assessment: {testPaths: ['one.test.js', 'two.test.js']},
      fingerprint: 'runtime-multi'
    });
    assert.equal(multi.kind, 'passed', multi.text);
    assert.equal(pagination.source, 'browser');
    assert.equal(pagination.fingerprint, 'runtime-fixture');
  } finally { env.close(); }
});

test('student-suite negatives reject empty/correct-failing, survivor, error and timeout mutants', async () => {
  const env = setup();
  try {
    const context = {TextEncoder}; context.window = context;
    vm.runInThisContext('(function(window){' + readFileSync('public/module-graph.js', 'utf8') + '})')(context);
    const graphApi = context.DevPathModuleGraph;
    context.DevPathModuleGraph = {buildModuleGraph: input => graphApi.buildModuleGraph(input, {build: esbuild.build, parse, transform: esbuild.transform})};
    context.DevPathCourseRunner = {run(code, finish) { let stopped = false; env.run(code, 2000).then(result => { if (!stopped) finish(result.kind, result.text, result.tests); }); return () => { stopped = true; }; }};
    vm.runInNewContext(readFileSync('public/course-assessment.js', 'utf8'), context);
    const assessment = {testPath: 'tests.js'};
    const correct = [{path: 'value.js', content: 'export const value = 2;'}];
    const suite = content => ({files: [{path: 'tests.js', content}], correctFiles: correct, assessment, fingerprint: 'negative'});
    const alwaysPass = await context.DevPathAssessment.runStudentSuite({...suite('import {it,expect} from "vitest";it("passa",()=>expect(true).toBe(true));'), mutantDirs: [{id: 'survivor', files: [{path: 'value.js', content: 'export const value = 2;'}]}]});
    assert.equal(alwaysPass.kind, 'failed');
    assert.match(alwaysPass.text, /Mutante sobrevivente/);
    const correctRejects = await context.DevPathAssessment.runStudentSuite(suite('import {it,expect} from "vitest";it("falha",()=>expect(false).toBe(true));'));
    assert.equal(correctRejects.kind, 'failed');
    const empty = await context.DevPathAssessment.runStudentSuite({...suite('console.log("sem testes");'), mutantDirs: [{id: 'mutant', files: [{path: 'value.js', content: 'export const value = 3;'}]}]});
    assert.equal(empty.kind, 'failed');
    const survivor = await context.DevPathAssessment.runStudentSuite({...suite('import {it,expect} from "vitest";import {value} from "./value.js";it("valor",()=>expect(value).toBe(2));'), correctFiles: [{path: 'value.js', content: 'export const value = 2;'}], mutantDirs: [{id: 'killed', files: [{path: 'value.js', content: 'export const value = 3;'}]}, {id: 'survivor', files: [{path: 'value.js', content: 'export const value = 2;'}]}]});
    assert.equal(survivor.kind, 'failed');
    const error = await context.DevPathAssessment.runStudentSuite({...suite('import {it,expect} from "vitest";import {value} from "./value.js";it("valor",()=>expect(value).toBe(2));'), mutantDirs: [{id: 'syntax', files: [{path: 'value.js', content: 'export const = ;'}]}]});
    assert.equal(error.kind, 'failed');
    const timeout = await context.DevPathAssessment.runStudentSuite({...suite('import {it,expect} from "vitest";import {value} from "./value.js";it("valor",()=>expect(value).toBe(2));'), mutantDirs: [{id: 'loop', files: [{path: 'value.js', content: 'export const value = (()=>{while(true){};})();'}]}]});
    assert.equal(timeout.kind, 'failed');
  } finally { env.close(); }
});

test('runner does not promote an unhandled top-level rejection', async () => {
  const env = setup();
  try {
    const result = await env.run('Promise.reject(new Error("solta"));');
    assert.notEqual(result.kind, 'result', result.text);
  } finally { env.close(); }
});
