import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {parse} from 'acorn';
import * as esbuild from 'esbuild-wasm';
import {setup} from './course-runner-harness.mjs';

function makeRuntime(records) {
  const context = {globalThis: {}, window: {}};
  context.globalThis = context.window;
  vm.runInNewContext(readFileSync('public/course-test-runtime.js', 'utf8'), context);
  const target = context.window;
  const runtime = target.DevPathTestRuntime.createTestRuntime({target, caseRecords: records});
  runtime.install(target);
  return {target, runtime};
}

test('first semantic mismatch binds by case id, reports safe values and never reevaluates captured input', async () => {
  const id = '04.04.media-de-dois-numeros-exempl-422f69a5';
  const record = {id, sourceTestPath: 'tests/04.04.test.js', inputExpression: 'media(...values)', matcher: 'toBe', expectedExpression: '3', negated: false, contractRule: 'media(...values) toBe 3', investigation: 'Confira a soma dos dois operandos.'};
  const {target, runtime} = makeRuntime([record]);
  let evaluations = 0;
  const values = [2, 4];
  target.test('soma', () => target.__devpathExpect(id, target.__devpathCaptureInput(id, values, () => { evaluations++; return values.reduce((a, b) => a + b, 0); })).toBe(3));
  const result = await runtime.run();
  assert.equal(result.failed, 1);
  assert.equal(evaluations, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(result.firstFailure)), {
    caseId: id, testName: 'soma', matcher: 'toBe', negated: false,
    inputExpression: 'media(...values)', inputRuntime: [2, 4], expected: 3, observed: 6,
    contractRule: 'media(...values) toBe 3', investigation: 'Confira a soma dos dois operandos.', sourceTestPath: 'tests/04.04.test.js'
  });
  runtime.restore();
});

test('module graph binds the annotated matcher to the correct ID and worker runtime once', async () => {
  const env = setup();
  vm.runInThisContext('(function(window){' + readFileSync('public/module-graph.js', 'utf8') + '})')(env.w);
  const graphApi = env.w.DevPathModuleGraph;
  const id = '04.04.media-fixture';
  const record = {id, sourceTestPath: 'tests/media.test.js', inputExpression: 'media(...values)', contractRule: 'media(...values) toBe 3', investigation: 'Confira a média.', matcher: 'toBe', expectedExpression: '3', negated: false};
  try {
    const graph = await graphApi.buildModuleGraph({files: [
      {path: 'tests/media.test.js', content: `import {it,expect} from 'vitest';import {media} from '../main.js';it('media',()=>{const values=[2,4];/*@case ${id}*/expect(__devpathCaptureInput('${id}',values,()=>media(...values))).toBe(3);});`},
      {path: 'main.js', content: 'export function media(...values){return values.reduce((sum,value)=>sum+value,0);}'}
    ], entryPath: 'tests/media.test.js', assertionCases: [record]}, {build: esbuild.build, parse, transform: esbuild.transform});
    const result = await env.runModule(graph, 2000, [record]);
    assert.equal(result.kind, 'result');
    assert.equal(result.tests.failed, 1);
    assert.equal(result.tests.firstFailure.caseId, id);
    assert.equal(result.tests.firstFailure.matcher, 'toBe');
    assert.deepEqual(JSON.parse(JSON.stringify(result.tests.firstFailure.inputRuntime)), [2, 4]);
    assert.equal(result.tests.firstFailure.observed, 6);
  } finally { env.close(); }
  assert.throws(() => graphApi.instrumentAssertionCases('/*@case 04.04.missing*/expect(value).toBe(1);', [], parse, 'tests.js'), /ausente/);
  assert.throws(() => graphApi.instrumentAssertionCases('/*@case 04.04.media-fixture*/const value=1;expect(value).toBe(1);', [record], parse, 'tests.js'), /sem assert correspondente/);
});

test('duplicate public case IDs bind each failing assertion to its own context', async () => {
  const env = setup();
  vm.runInThisContext('(function(window){' + readFileSync('public/module-graph.js', 'utf8') + '})')(env.w);
  const graphApi = env.w.DevPathModuleGraph;
  const id = '21.04.lru-refresh-eviction';
  const records = [
    {id, sourceTestPath: 'tests/duplicate.test.js', testName: 'recency', inputExpression: "memoized('B')", contractRule: "memoized('B') toBe 'B'", investigation: 'Confirme o valor do cache.'},
    {id, sourceTestPath: 'tests/duplicate.test.js', testName: 'recency', inputExpression: 'calls', contractRule: 'calls toBe 4', investigation: 'Confirme a quantidade de cálculos.'},
  ];
  const source = (firstExpected) => `import {it,expect} from 'vitest';\nconst first = 'B'; const calls = 3;\nit('first',()=>{/*@case ${id}*/expect(first).toBe(${JSON.stringify(firstExpected)});});\nit('second',()=>{/*@case ${id}*/expect(calls).toBe(4);});`;
  try {
    for (const [firstExpected, expectedRule, expectedInput] of [
      ['A', records[0].contractRule, records[0].inputExpression],
      ['B', records[1].contractRule, records[1].inputExpression],
    ]) {
      const graph = await graphApi.buildModuleGraph({files: [{path: 'tests/duplicate.test.js', content: source(firstExpected)}], entryPath: 'tests/duplicate.test.js', assertionCases: records}, {build: esbuild.build, parse, transform: esbuild.transform});
      const result = await env.runModule(graph, 2000, records);
      assert.equal(result.tests.failed, firstExpected === 'A' ? 2 : 1, result.text);
      assert.equal(result.tests.firstFailure.contractRule, expectedRule);
      assert.equal(result.tests.firstFailure.inputExpression, expectedInput);
    }
  } finally { env.close(); }
});

test('first failure preserves not/resolves/rejects semantics and does not invent input values', async () => {
  const records = [
    {id: '04.04.not-case', sourceTestPath: 'tests/04.04.test.js', inputExpression: 'calcular()', contractRule: 'calcular() não toBe 1', investigation: 'Revise a comparação.'},
    {id: '04.04.reject-case', sourceTestPath: 'tests/04.04.test.js', inputExpression: 'carregar()', contractRule: 'carregar() rejects toBe 7', investigation: 'Revise a rejeição.'},
  ];
  const {target, runtime} = makeRuntime(records);
  target.test('negação', () => target.__devpathExpect('04.04.not-case', 1).not.toBe(1));
  target.test('rejeição', async () => await target.__devpathExpect('04.04.reject-case', Promise.resolve(7)).rejects.toBe(7));
  const result = await runtime.run();
  assert.equal(result.failed, 2);
  const failure = JSON.parse(JSON.stringify(result.firstFailure));
  assert.equal(failure.caseId, '04.04.not-case');
  assert.equal(failure.matcher, 'toBe');
  assert.equal(failure.negated, true);
  assert.equal(failure.inputRuntime, undefined);
  assert.equal(failure.inputExpression, 'calcular()');
  runtime.restore();

  const rejected = makeRuntime([{id: '04.04.reject-case', sourceTestPath: 'tests/04.04.test.js', inputExpression: 'carregar()', contractRule: 'carregar() rejects toBe 8', investigation: 'Revise a rejeição.'}]);
  rejected.target.test('rejeição', async () => await rejected.target.__devpathExpect('04.04.reject-case', Promise.reject(new Error('7'))).rejects.toBe('8'));
  const rejectResult = await rejected.runtime.run();
  assert.equal(rejectResult.failed, 1);
  assert.equal(rejectResult.firstFailure.matcher, 'rejects.toBe');
  assert.equal(rejectResult.firstFailure.inputRuntime, undefined);
  rejected.runtime.restore();

  const thrown = makeRuntime([{id: '04.04.throw-case', sourceTestPath: 'tests/04.04.test.js', inputExpression: '() => executar()', contractRule: 'executar() toThrow RangeError', investigation: 'Revise o tipo do erro.'}]);
  thrown.target.test('throw', () => thrown.target.__devpathExpect('04.04.throw-case', () => { throw new TypeError('bad'); }).toThrow(RangeError));
  const thrownResult = await thrown.runtime.run();
  assert.equal(thrownResult.firstFailure.matcher, 'toThrow');
  assert.equal(thrownResult.firstFailure.expected.name, 'RangeError');
  assert.deepEqual(JSON.parse(JSON.stringify(thrownResult.firstFailure.observed)), {type: 'error', name: 'TypeError', message: 'bad'});
  thrown.runtime.restore();

  const resolved = makeRuntime([{id: '04.04.resolves-case', sourceTestPath: 'tests/04.04.test.js', inputExpression: 'carregar()', contractRule: 'carregar() resolves.toBe 2', investigation: 'Revise o resultado assíncrono.'}]);
  resolved.target.test('resolves', async () => await resolved.target.__devpathExpect('04.04.resolves-case', Promise.resolve(1)).resolves.toBe(2));
  const resolvedResult = await resolved.runtime.run();
  assert.equal(resolvedResult.firstFailure.matcher, 'resolves.toBe');
  assert.equal(resolvedResult.firstFailure.observed, 1);
  resolved.runtime.restore();
});

test('assessment exposes semantic feedback only for a failed behavioral result', async () => {
  const failure = {caseId: '04.04.case', matcher: 'rejects.toBe', negated: true, contractRule: 'carregar(api) rejects.not.toBe 3', expected: 3, observed: 6};
  const context = {TextEncoder, crypto: webcrypto, window: null};
  context.window = context;
  context.DevPathModuleGraph = {buildModuleGraph: async () => ({code: 'bundle', dispose() {}})};
  context.DevPathCourseRunner = {run(_code, finish) { queueMicrotask(() => finish('result', '1 teste falhou.', {passed: 0, failed: 1, total: 1, firstFailure: failure})); return () => {}; }};
  vm.runInNewContext(readFileSync('public/course-assessment.js', 'utf8'), context);
  const api = context.DevPathAssessment;
  const assessment = {environment: 'javascript', version: 1, checks: ['behavior'], testPath: 'tests/a.test.js', assertionCases: [{id: failure.caseId, inputExpression: 'sum(values)', expectedExpression: '3'}]};
  const result = await api.run({item: {id: '04.04', contentVersion: 1}, assessment, files: [{path: 'src.js', content: 'export const x = 1;'}], fingerprint: 'source-fp'});
  assert.equal(result.kind, 'failed');
  assert.equal(result.firstFailure.caseId, failure.caseId);
  assert.match(result.text, /Primeira divergência · 04\.04\.case/);
  assert.match(result.text, /Matcher: rejects\.not\.toBe/);
  assert.equal(result.source, 'browser');
  for (const kind of ['timeout', 'error', 'type-error', 'unsupported']) {
    const infraContext = {TextEncoder, crypto: webcrypto, window: null};
    infraContext.window = infraContext;
    infraContext.DevPathModuleGraph = context.DevPathModuleGraph;
    infraContext.DevPathCourseRunner = {run(_code, finish) { queueMicrotask(() => finish(kind, 'falha de infraestrutura', {firstFailure: failure})); return () => {}; }};
    vm.runInNewContext(readFileSync('public/course-assessment.js', 'utf8'), infraContext);
    const result = await infraContext.DevPathAssessment.run({item: {id: '04.04', contentVersion: 1}, assessment, files: [{path: 'src.js', content: 'export const x = 1;'}], fingerprint: 'source-fp'});
    assert.equal(result.kind, kind);
    assert.equal(result.firstFailure, undefined, kind);
    assert.doesNotMatch(result.text, /Primeira divergência · 04\.04\.case/);
  }
});
