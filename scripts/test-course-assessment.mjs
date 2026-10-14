import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import {existsSync, readFileSync} from 'node:fs';
import {webcrypto} from 'node:crypto';
import {parse as acornParse} from 'acorn';

const caseMarkerPath = new URL('../public/course-case-markers.js', import.meta.url);
const caseMarkerSource = existsSync(caseMarkerPath) ? readFileSync(caseMarkerPath, 'utf8') : '';

function load({typeResult = {kind: 'passed', diagnostics: []}, typeChecker, runnerResult = {kind: 'result', text: 'ok', tests: {passed: 1, failed: 0, total: 1}}, runnerImpl, domRunner, nodeRuntime, moduleGraphImpl, withoutCrypto = false, withoutParser = false} = {}) {
  const w = {TextEncoder, crypto: withoutCrypto ? {} : webcrypto, ...(withoutParser ? {} : {DevPathCompilerEngine: {parse: acornParse}})};
  w.window = w;
  w.DevPathTypeChecker = {check: typeChecker || (async () => typeResult)};
  w.DevPathModuleGraph = {buildModuleGraph: moduleGraphImpl || (async ({files, entryPath}) => ({code: `${entryPath}:${files.length}`, dispose() {}}))};
  w.DevPathCourseRunner = {run: runnerImpl || ((code, finish) => { queueMicrotask(() => finish(runnerResult.kind, runnerResult.text, runnerResult.tests)); return () => {}; })};
  if (domRunner) w.DevPathDomRunner = {run: domRunner};
  if (nodeRuntime) w.DevPathNodeRuntime = nodeRuntime;
  vm.runInNewContext(caseMarkerSource, w);
  vm.runInNewContext(readFileSync('public/course-assessment.js', 'utf8'), w);
  return w.DevPathAssessment;
}

const base = {id: 'T.01', contentVersion: 1};
const files = [{path: 'main.js', content: 'export const answer = 1;'}];

test('behavior checks require a nonempty executable declaration', async () => {
  const api = load();
  const result = await api.run({item: base, assessment: {environment: 'javascript', version: 1, checks: ['behavior']}, files, fingerprint: 'f'});
  assert.equal(result.kind, 'unsupported');
  assert.equal(result.source, 'browser');
});

test('empty and failing behavior suites never pass', async () => {
  const empty = load({runnerResult: {kind: 'result', text: 'empty', tests: {passed: 0, failed: 0, total: 0}}});
  const failed = load({runnerResult: {kind: 'result', text: 'failed', tests: {passed: 1, failed: 1, total: 2}}});
  const assessment = {environment: 'javascript', version: 1, checks: ['behavior'], tests: 'test("x", () => {});'};
  assert.equal((await empty.run({item: base, assessment, files, fingerprint: 'f'})).kind, 'failed');
  assert.equal((await failed.run({item: base, assessment, files, fingerprint: 'f'})).kind, 'failed');
});

test('studentSuite uses the mutation evaluator even when the published check is behavior', async () => {
  const seen = [];
  let execution = 0;
  const api = load({runnerResult: {kind: 'result', text: 'passed', tests: {passed: 1, failed: 0, total: 1}}, moduleGraphImpl: async ({files, entryPath}) => {
    seen.push({files, entryPath});
    return {code: JSON.stringify({entryPath, files})};
  }, runnerImpl: (code, finish) => {
    const isMutant = execution++ > 0;
    queueMicrotask(() => finish('result', isMutant ? 'mutant failed' : 'correct passed', isMutant ? {passed: 0, failed: 1, total: 1} : {passed: 1, failed: 0, total: 1}));
    return () => {};
  }});
  const assessment = {
    environment: 'javascript', version: 1, checks: ['behavior'], studentSuite: true,
    testPaths: ['tests/student.test.js'],
    correctFiles: [{path: 'src.js', content: 'export const value = 1;'}],
    mutantDirs: [{id: 'wrong-value', files: [{path: 'src.js', content: 'export const value = 2;'}]}],
  };
  const result = await api.run({item: base, assessment, files: [
    {path: 'helpers/expectations.js', content: 'export const helper = true;'},
    {path: 'tests/student.test.js', content: 'import "../src.js"; import "../helpers/expectations.js"; test("value",()=>{});'},
  ], fingerprint: 'f'});
  assert.equal(result.kind, 'passed');
  assert.equal(seen.length, 2, 'correct implementation and mutant both run the learner suite');
  assert.equal(seen[0].files.some(file => file.path === 'helpers/expectations.js'), true);
  assert.equal(seen[0].files.some(file => file.path === 'tests/student.test.js'), true);
});

test('student implementation suites run against the submitted entry before mutant grading', async () => {
  const seen = [];
  const api = load({
    moduleGraphImpl: async ({files, entryPath}) => {
      seen.push({files, entryPath});
      return {code: `${entryPath}:${files.map(file => file.path).join(',')}`};
    },
    runnerImpl: (code, finish) => {
      const defective = code.module?.includes('clamp.js') && seen[0]?.files.some(file => file.path === 'clamp.js' && file.content.includes('return valor'));
      queueMicrotask(() => finish('result', defective ? 'lower boundary failed' : 'passed', defective ? {passed: 0, failed: 1, total: 1} : {passed: 1, failed: 0, total: 1}));
      return () => {};
    },
  });
  const assessment = {
    environment: 'javascript', version: 1, checks: ['behavior', 'mutation'], studentSuite: true,
    behaviorTestPath: 'tests/clamp.test.js', testPaths: ['tests/clamp.test.js'],
    correctFiles: [{path: 'clamp.js', content: 'export function clamp(v,min,max){return Math.min(Math.max(v,min),max)};'}],
    mutantDirs: [{id: 'wrong', files: [{path: 'clamp.js', content: 'export function clamp(v,min,max){return v};'}]}],
  };
  const result = await api.run({item: base, assessment, files: [
    {path: 'clamp.js', content: 'export function clamp(valor,minimo,maximo){return valor}'},
    {path: 'tests/clamp.test.js', content: 'test("lower bound",()=>{});'},
  ], fingerprint: 'f'});
  assert.equal(result.kind, 'failed');
  assert.match(result.text, /implementa[cç][aã]o enviada/i);
  assert.equal(seen.length, 1, 'failed submitted behavior must stop before mutation grading');
  assert.equal(seen[0].entryPath, 'tests/clamp.test.js');
  assert.ok(seen[0].files.some(file => file.path === 'clamp.js' && file.content.includes('return valor')));
});

test('student implementation suite also grades the corrected submission before mutants', async () => {
  let execution = 0;
  const seen = [];
  const api = load({
    moduleGraphImpl: async ({files, entryPath}) => {
      seen.push({files, entryPath});
      return {code: `${entryPath}:${files.map(file => file.path).join(',')}`};
    },
    runnerImpl: (_code, finish) => {
      const current = execution++;
      const mutant = current === 2;
      queueMicrotask(() => finish('result', mutant ? 'mutant failed' : 'passed', mutant ? {passed: 0, failed: 1, total: 1} : {passed: 1, failed: 0, total: 1}));
      return () => {};
    },
  });
  const assessment = {
    environment: 'javascript', version: 1, checks: ['behavior', 'mutation'], studentSuite: true,
    behaviorTestPath: 'tests/clamp.test.js', testPaths: ['tests/clamp.test.js'],
    correctFiles: [{path: 'clamp.js', content: 'export function clamp(v,min,max){return Math.min(Math.max(v,min),max)};'}],
    mutantDirs: [{id: 'wrong', files: [{path: 'clamp.js', content: 'export function clamp(v,min,max){return v};'}]}],
  };
  const result = await api.run({item: base, assessment, files: [
    {path: 'clamp.js', content: 'export function clamp(valor,minimo,maximo){return Math.min(Math.max(valor,minimo),maximo)}'},
    {path: 'tests/clamp.test.js', content: 'test("lower bound",()=>{});'},
  ], fingerprint: 'f'});
  assert.equal(result.kind, 'passed');
  assert.equal(seen.length, 3, 'submitted code, correct reference and mutant all receive the suite');
  assert.equal(seen[0].entryPath, 'tests/clamp.test.js');
  assert.ok(seen[0].files.some(file => file.path === 'clamp.js' && file.content.includes('Math.min')));
});

test('studentSuite rejects an empty learner suite instead of using editorial tests', async () => {
  const api = load();
  const result = await api.run({item: base, assessment: {
    environment: 'javascript', version: 1, checks: ['behavior'], studentSuite: true,
    tests: 'test("editorial fallback", () => {});',
    correctFiles: [{path: 'src.js', content: 'export const value = 1;'}],
    mutantDirs: [{id: 'wrong-value', files: [{path: 'src.js', content: 'export const value = 2;'}]}],
  }, files: [{path: 'src.js', content: 'export const value = 1;'}], fingerprint: 'f'});
  assert.equal(result.kind, 'failed');
  assert.match(result.text, /su[ií]te do aluno est[aá] vazia/i);
});

test('types gate behavior even for a JavaScript environment', async () => {
  const api = load({typeResult: {kind: 'type-error', diagnostics: [{code: 2322}]}});
  const result = await api.run({item: base, assessment: {environment: 'javascript', version: 1, checks: ['types', 'behavior'], tests: 'test("x", () => {});'}, files, fingerprint: 'f'});
  assert.equal(result.kind, 'type-error');
  assert.equal(result.diagnostics[0].code, 2322);
});

test('typed learner suites retain declaration files and override them with each semantic mutant', async () => {
  const calls = [];
  const typeApi = load({typeChecker: async input => {
    calls.push(input);
    const declaration = input.files.find(file => file.path === 'index.d.ts')?.content || '';
    if (declaration.includes(':any')) return {kind: 'type-error', supported: true, diagnostics: [{code: 2345, category: 'error', file: 'tipos.test.ts'}]};
    return {kind: 'passed', supported: true, diagnostics: []};
  }});
  const assessment = {
    environment: 'typescript', version: 1, checks: ['types', 'mutation'], studentSuite: true,
    studentSuiteKind: 'types', testPaths: ['tipos.test.ts'], entryPath: 'tipos.test.ts',
    correctFiles: [{path: 'index.d.ts', content: 'export declare function parse(value:string): number;'}],
    mutantDirs: [{id: 'wide-parameter', files: [{path: 'index.d.ts', content: 'export declare function parse(value:any): number;'}]}],
  };
  // A dedicated VM loader hook is used by the companion helper below.
  const result = await typeApi.run({item: base, assessment, files: [
    {path: 'tipos.test.ts', content: 'import {parse} from "./index.js"; parse("x"); // learner-authored suite'},
  ], fingerprint: 'typed-suite'});
  assert.equal(result.kind, 'passed');
  assert.equal(result.tests.total, 2);
  assert.equal(calls.length, 3, 'submitted baseline, reference, and one independent mutant are checked');
  assert.equal(calls[1].files.find(file => file.path === 'index.d.ts')?.content, 'export declare function parse(value:string): number;');
  assert.equal(calls[2].files.find(file => file.path === 'index.d.ts')?.content, 'export declare function parse(value:any): number;');
  assert.equal(calls[1].files.find(file => file.path === 'tipos.test.ts')?.content, calls[2].files.find(file => file.path === 'tipos.test.ts')?.content);
});

test('typecheck success permits behavior and normalizes result to passed', async () => {
  const api = load();
  const result = await api.run({item: base, assessment: {environment: 'typescript', version: 1, entryPath: 'main.ts', checks: ['types', 'behavior'], tests: 'test("x", () => {});'}, files: [{path: 'main.ts', content: 'export const answer: number = 1;'}], fingerprint: 'f'});
  assert.equal(result.kind, 'passed', result.text);
  assert.equal(result.tests.total, 1);
  assert.equal(result.source, 'browser');
  assert.equal(result.fingerprint, 'f');
  assert.equal(typeof result.text, 'string');
  assert.ok(Array.isArray(result.diagnostics));
});

test('TypeScript behavior cannot run without the types check', async () => {
  const api = load();
  assert.throws(() => api.validateManifest({'04.04': {environment: 'typescript', version: 1, entryPath: 'main.ts', checks: ['behavior'], testPath: 'tests/x.js'}}, {ids: new Set(['04.04'])}), /exige typecheck/);
  const result = await api.run({item: base, assessment: {environment: 'typescript', version: 1, entryPath: 'main.ts', checks: ['behavior'], tests: 'test("x", () => {});'}, files: [{path: 'main.ts', content: 'export const answer = 1;'}], fingerprint: 'f'});
  assert.equal(result.kind, 'unsupported');
});

test('TypeScript files cannot bypass type checks under a mislabeled JavaScript assessment', async () => {
  const api = load();
  const result = await api.run({item: base, assessment: {environment: 'javascript', version: 1, checks: ['behavior'], tests: 'test("x", () => {});'}, files: [{path: 'main.ts', content: 'export const answer: number = 1;'}], fingerprint: 'f'});
  assert.equal(result.kind, 'unsupported');
});

test('adapter output cannot replace the caller source or fingerprint', async () => {
  const api = load({typeResult: {kind: 'type-error', text: 'spoof', source: 'evil', fingerprint: 'evil', diagnostics: [{code: 2322}]} });
  const result = await api.run({item: base, assessment: {environment: 'typescript', version: 1, entryPath: 'main.ts', checks: ['types']}, files: [{path: 'main.ts', content: 'export const answer: number = 1;'}], fingerprint: 'caller'});
  assert.equal(result.source, 'browser');
  assert.equal(result.fingerprint, 'caller');
  assert.equal(result.kind, 'type-error');
  assert.deepEqual(result.diagnostics, [{code: 2322}]);
  assert.equal(typeof result.text, 'string');
});

test('behavior runner output keeps the caller source and fingerprint and normalizes test counts', async () => {
  const api = load({runnerImpl: (code, finish) => {
    queueMicrotask(() => finish('result', 'runner output', {passed: 8, failed: 0, total: 8, source: 'evil', fingerprint: 'evil'}, 'ignored fourth argument'));
    return () => {};
  }});
  const result = await api.run({item: base, assessment: {environment: 'javascript', version: 1, checks: ['behavior'], tests: 'test("x", () => {});'}, files, fingerprint: 'caller'});
  assert.equal(result.kind, 'passed');
  assert.equal(result.source, 'browser');
  assert.equal(result.fingerprint, 'caller');
  assert.equal(result.tests.passed, 8);
  assert.equal(result.tests.failed, 0);
  assert.equal(result.tests.total, 8);
});

test('DOM and network behavior do not fall back to JavaScript execution', async () => {
  const api = load();
  const result = await api.run({item: base, assessment: {environment: 'dom', version: 1, checks: ['behavior'], tests: 'test("x", () => {});'}, files, fingerprint: 'f'});
  assert.equal(result.kind, 'unsupported');
});

test('protected DOM behavior runs against submitted HTML and source', async () => {
  let captured;
  const protectedTests='test("measures page", () => { expect(document.querySelector("#resultados")).toBeTruthy(); });';
  const api=load({domRunner:async(spec)=>{captured=spec;return{kind:'passed',text:'DOM checks passed',tests:{passed:1,failed:0,total:1}};}});
  const result=await api.run({item:base,assessment:{environment:'dom',version:1,checks:['behavior'],entryPath:'index.html',behaviorTestPath:'__protected_dom__.js',tests:protectedTests},files:[{path:'index.html',content:'<main><tbody id="resultados"></tbody></main>'},{path:'lab.js',content:'export const ok=true;'}],fingerprint:'dom-fingerprint'});
  assert.equal(result.kind,'passed');
  assert.equal(result.fingerprint,'dom-fingerprint');
  assert.equal(captured.entryPath,'index.html');
  assert.equal(captured.files.find(file=>file.path==='index.html').content.includes('resultados'),true);
  assert.equal(captured.testCode,protectedTests);
});

test('DOM mutation suites merge learner helpers and tests while protecting correct and mutant implementation paths', async () => {
  const seen = [];
  const api = load({domRunner: async spec => {
    seen.push(spec);
    const main = spec.files.find(file => file.path === 'main.js')?.content || '';
    const hasHelper = spec.files.some(file => file.path === 'helpers/assertions.js');
    const hasTests = spec.files.some(file => file.path === 'tests/ui.test.js');
    assert.equal(hasHelper, true);
    assert.equal(hasTests, true);
    assert.equal(spec.files.some(file => file.path === '__devpath_student_tests__.js'), false);
    assert.match(spec.testCode, /\.\/tests\/ui\.test\.js/);
    return {kind: main.includes('textContent') ? 'passed' : 'failed', text: 'suite', tests: {passed: main.includes('textContent') ? 1 : 0, failed: main.includes('textContent') ? 0 : 1, total: 1}};
  }});
  const assessment = {
    environment: 'dom', version: 1, checks: ['mutation'], studentSuite: true, entryPath: 'main.js',
    testPaths: ['tests/ui.test.js'],
    tests: 'test("editorial fallback",()=>{ throw new Error("must not replace the student suite"); });',
    correctFiles: [{path: 'main.js', content: 'export function render(node){ node.textContent = "ok"; }'}],
    mutantDirs: [{id: 'unsafe-html', files: [{path: 'main.js', content: 'export function render(node){ node.innerHTML = "ok"; }'}]}],
  };
  const result = await api.run({item: base, assessment, files: [
    {path: 'main.js', content: 'export function render(node){ node.textContent = "learner"; }'},
    {path: 'helpers/assertions.js', content: 'export const assertText = () => {};'},
    {path: 'tests/ui.test.js', content: 'import {render} from "../main.js"; test("render", () => {});'},
  ], fingerprint: 'f'});
  assert.equal(result.kind, 'passed', result.text);
  assert.equal(seen.length, 2);
  assert.match(seen[0].files.find(file => file.path === 'main.js').content, /textContent/);
  assert.match(seen[1].files.find(file => file.path === 'main.js').content, /innerHTML/);
});

test('DOM inline suites use a synthetic test module at the declared test path', async () => {
  let captured;
  let calls = 0;
  const api = load({domRunner: async spec => {
    captured = spec;
    return calls++ === 0
      ? {kind: 'passed', text: 'ok', tests: {passed: 1, failed: 0, total: 1}}
      : {kind: 'failed', text: 'mutant', tests: {passed: 0, failed: 1, total: 1}};
  }});
  const result = await api.run({item: base, assessment: {environment: 'dom', version: 1, checks: ['mutation'], entryPath: 'main.js', testPath: 'tests/declared.js', tests: 'test("inline",()=>{});', correctFiles: files, mutantDirs: [{id: 'mutant', files}]}, files, fingerprint: 'f'});
  assert.equal(result.kind, 'passed');
  assert.ok(captured.files.some(file => file.path === 'tests/declared.js'));
  assert.match(captured.testCode, /tests\/declared\.js/);
});

test('abort reaches the legacy runner stop callback and returns cancelled', async () => {
  const api = load({runnerImpl: (code, finish) => { const timer = setTimeout(() => finish('timeout', 'late'), 2000); return () => { clearTimeout(timer); finish('cancelled', 'stopped'); }; }});
  const controller = new AbortController();
  const pending = api.run({item: base, assessment: {environment: 'javascript', version: 1, checks: ['behavior'], tests: 'test("x", () => {});'}, files, signal: controller.signal, fingerprint: 'f'});
  controller.abort();
  assert.equal((await pending).kind, 'cancelled');
});

test('local declarations do not become browser approvals without an execution adapter', async () => {
  const api = load();
  const result = await api.run({item: base, assessment: {environment: 'local', version: 1, checks: ['local'], local: {commands: [['npm', 'test']]}}, files, fingerprint: 'f'});
  assert.equal(result.kind, 'unsupported');
});

test('unsupported node builtins remain an explicit unsupported assessment result', async () => {
  const api = load({
    nodeRuntime: {createNodeRuntime() { return {}; }},
    moduleGraphImpl: async () => {
      const error = new Error('Node module not supported: node:child_process');
      error.code = 'UNSUPPORTED';
      throw error;
    },
  });
  const result = await api.run({item: base, assessment: {environment: 'node-simulated', version: 1, checks: ['behavior'], tests: 'test("x", () => {});'}, files, fingerprint: 'f'});
  assert.equal(result.kind, 'unsupported');
  assert.equal(result.source, 'browser');
});

test('fingerprinting fails closed when SHA-256 is unavailable', async () => {
  const api = load({withoutCrypto: true});
  await assert.rejects(() => api.canonicalFingerprint({activityId: '04.04', files}), /SHA-256/);
});

test('expected diagnostics require an exact investigation match', async () => {
  const api = load({typeResult: {kind: 'type-error', diagnostics: [{code: 2322, file: 'main.ts', line: 1} ]}});
  const result = await api.run({item: base, assessment: {environment: 'typescript', version: 1, entryPath: 'main.ts', checks: ['types'], expectedDiagnostics: [{code: 2322, file: 'main.ts', line: 1}]}, files: [{path: 'main.ts', content: 'let x: number = "x";'}], fingerprint: 'f'});
  assert.equal(result.kind, 'passed');
  const extra = await api.run({item: base, assessment: {environment: 'typescript', version: 1, entryPath: 'main.ts', checks: ['types'], expectedDiagnostics: [{code: 2322, file: 'main.ts', line: 1}, {code: 2345, file: 'main.ts', line: 1}]}, files: [{path: 'main.ts', content: 'let x: number = "x";'}], fingerprint: 'f'});
  assert.equal(extra.kind, 'type-error');
});

test('manifest validation rejects checks without behavior evidence and accepts local commands', () => {
  const api = load();
  assert.throws(() => api.validateManifest({ '04.04': {environment: 'javascript', version: 1, checks: ['behavior']} }, {ids: new Set(['04.04'])}), /Behavior sem testes/);
  assert.doesNotThrow(() => api.validateManifest({ '04.04': {environment: 'local', version: 1, checks: ['local'], local: {commands: [['npm', 'test']]}} }, {ids: new Set(['04.04'])}));
});

test('fingerprint includes activity, versions and sorted file contents', async () => {
  const api = load();
  const assessment = {environment: 'javascript', version: 1, checks: ['behavior'], tests: 'test("a", () => {});'};
  const first = await api.canonicalFingerprint({activityId: '04.04', contentVersion: 1, assessmentVersion: 1, assessment, files: [{path: 'b.js', content: '2'}, {path: 'a.js', content: '1'}]});
  const same = await api.canonicalFingerprint({activityId: '04.04', contentVersion: 1, assessmentVersion: 1, assessment, files: [{path: 'a.js', content: '1'}, {path: 'b.js', content: '2'}]});
  const changed = await api.canonicalFingerprint({activityId: '04.04', contentVersion: 2, assessmentVersion: 1, assessment, files: [{path: 'a.js', content: '1'}, {path: 'b.js', content: '2'}]});
  const changedTests = await api.canonicalFingerprint({activityId: '04.04', contentVersion: 1, assessmentVersion: 1, assessment: {...assessment, tests: 'test("a", () => { throw new Error(); });'}, files: [{path: 'a.js', content: '1'}, {path: 'b.js', content: '2'}]});
  const studentSuite = {...assessment, studentSuite: true, testPaths: ['tests/a.test.js'], correctFiles: [{path: 'src.js', content: 'export const value=1'}], mutantDirs: [{id: 'wrong', files: [{path: 'src.js', content: 'export const value=2'}]}]};
  const studentSuiteChanged = await api.canonicalFingerprint({activityId: '04.04', contentVersion: 1, assessmentVersion: 1, assessment: {...studentSuite, correctFiles: [{path: 'src.js', content: 'export const value=3'}]}, files: [{path: 'test.js', content: 'test()'}]});
  const studentSuiteOriginal = await api.canonicalFingerprint({activityId: '04.04', contentVersion: 1, assessmentVersion: 1, assessment: studentSuite, files: [{path: 'test.js', content: 'test()'}]});
  assert.equal(first, same);
  assert.notEqual(first, changed);
  assert.notEqual(first, changedTests);
  assert.notEqual(studentSuiteOriginal, studentSuiteChanged);
});

test('anotação exata de caso não muda fingerprint de suite reconhecida', async () => {
  const api = load();
  const common = {activityId: '04.04', files: [{path: 'tests/a.test.js', content: 'test("x",()=>{/*@case 04.04.a*/expect(x).toBe(1)});'}]};
  const withMarker = await api.canonicalFingerprint({...common, assessment: {environment: 'javascript', version: 1, checks: ['behavior'], testPath: 'tests/a.test.js', tests: 'test("x",()=>{/*@case 04.04.a*/expect(x).toBe(1)});'}});
  const withoutMarker = await api.canonicalFingerprint({...common, assessment: {environment: 'javascript', version: 1, checks: ['behavior'], testPath: 'tests/a.test.js', tests: 'test("x",()=>{expect(x).toBe(1)});'}, files: [{path: 'tests/a.test.js', content: 'test("x",()=>{expect(x).toBe(1)});'}]});
  assert.equal(withMarker, withoutMarker);
  const literalMarker = await api.canonicalFingerprint({...common, assessment: {environment: 'javascript', version: 1, checks: ['behavior'], testPath: 'tests/a.test.js', tests: 'test("x",()=>{expect("/*@case 04.04.a*/").toBe(1)});'}});
  assert.notEqual(withoutMarker, literalMarker, 'marcador dentro de string é código, não comentário');
  const otherComment = await api.canonicalFingerprint({...common, assessment: {environment: 'javascript', version: 1, checks: ['behavior'], testPath: 'tests/a.test.js', tests: 'test("x",()=>{/* editorial */expect(x).toBe(1)});'}, files: [{path: 'tests/a.test.js', content: 'test("x",()=>{/* editorial */expect(x).toBe(1)});'}]});
  assert.notEqual(withoutMarker, otherComment, 'comentários fora do marcador permanecem no hash');
  const regexSource = String.raw`const pattern = /\/*@case 04\.04\.a*/;`;
  const regexChangedSource = String.raw`const pattern = /\/*@case 04\.04\.b*/;`;
  const regexMarker = await api.canonicalFingerprint({...common, assessment: {environment: 'javascript', version: 1, checks: ['behavior'], testPath: 'tests/a.test.js', tests: regexSource}, files: [{path: 'tests/a.test.js', content: regexSource}]});
  const regexChanged = await api.canonicalFingerprint({...common, assessment: {environment: 'javascript', version: 1, checks: ['behavior'], testPath: 'tests/a.test.js', tests: regexChangedSource}, files: [{path: 'tests/a.test.js', content: regexChangedSource}]});
  assert.notEqual(regexMarker, regexChanged, 'texto com aparência de marcador dentro de regex literal não é removido');
});

test('fingerprint preserva regex depois de controle e bloco, sem confundir strings, templates ou comentários', async () => {
  const api = load();
  const fingerprint = source => api.canonicalFingerprint({
    activityId: '04.04', files: [],
    assessment: {environment: 'javascript', version: 1, checks: ['behavior'], testPath: 'tests/a.test.js', tests: source},
  });
  const sources = [
    marker => `if (true) return /[/*@case 04.04.${marker}*/]/.test('b');`,
    marker => `if (true) {} return /[/*@case 04.04.${marker}*/]/.test('b');`,
  ];
  for (const source of sources) {
    const a = `(() => { ${source('a')} })()`;
    const b = `(() => { ${source('b')} })()`;
    acornParse(a, {ecmaVersion: 'latest', sourceType: 'module'});
    acornParse(b, {ecmaVersion: 'latest', sourceType: 'module'});
    assert.notEqual(vm.runInNewContext(a), vm.runInNewContext(b), 'the regex edit changes actual behavior');
    assert.notEqual(await fingerprint(a), await fingerprint(b), 'regex pattern changes must affect identity');
  }
  const marked = 'test("x",()=>{/*@case 04.04.a*/expect("/*@case 04.04.b*/").toBe(`/*@case 04.04.c*/ ${1}`); /* editorial */});';
  const unmarked = 'test("x",()=>{expect("/*@case 04.04.b*/").toBe(`/*@case 04.04.c*/ ${1}`); /* editorial */});';
  assert.equal(await fingerprint(marked), await fingerprint(unmarked), 'only a real @case comment is ignored');
  assert.notEqual(await fingerprint(unmarked), await fingerprint(unmarked.replace('/* editorial */', '/* edited */')), 'editorial comments remain part of the fingerprint');
});

test('fingerprint conservatively retains markers when parsing is unavailable or JavaScript is invalid', async () => {
  const api = load();
  const source = 'test("x",()=>{ /*@case 04.04.a*/ expect(x).toBe(1);';
  const changed = source.replace('04.04.a', '04.04.b');
  const fingerprint = (assessment, tests) => api.canonicalFingerprint({activityId: '04.04', files: [], assessment: {...assessment, tests}});
  const assessment = {environment: 'javascript', version: 1, checks: ['behavior'], testPath: 'tests/a.test.js'};
  assert.notEqual(await fingerprint(assessment, source), await fingerprint(assessment, changed), 'invalid source keeps marker bytes in identity');
  const withoutParser = load({withoutParser: true});
  const unavailableFingerprint = tests => withoutParser.canonicalFingerprint({activityId: '04.04', files: [], assessment: {...assessment, tests}});
  assert.notEqual(await unavailableFingerprint(source), await unavailableFingerprint(changed), 'missing parser never strips bytes heuristically');
});

test('removing an annotation preserves a lexical separator between adjacent tokens', async () => {
  const api = load();
  const fingerprint = tests => api.canonicalFingerprint({
    activityId: '04.04', files: [],
    assessment: {environment: 'javascript', version: 1, checks: ['behavior'], testPath: 'tests/a.test.js', tests},
  });
  assert.equal(await fingerprint('test("x",()=>{ const ok = a in {a: 1}; });'), await fingerprint('test("x",()=>{ const ok = a/*@case 04.04.separator*/in {a: 1}; });'));
});

test('separator handling preserves Unicode return names and division/addition token boundaries', async () => {
  const api = load();
  const fingerprint = tests => api.canonicalFingerprint({
    activityId: '04.04', files: [],
    assessment: {environment: 'javascript', version: 1, checks: ['behavior'], testPath: 'tests/a.test.js', tests},
  });
  const unicodeMarked = '(()=>{const é=1;return/*@case 04.04.unicode*/é})()';
  const unicodePlain = '(()=>{const é=1;return é})()';
  assert.equal(vm.runInNewContext(unicodeMarked), 1);
  assert.equal(vm.runInNewContext(unicodePlain), 1);
  assert.equal(await fingerprint(unicodeMarked), await fingerprint(unicodePlain));

  const divisionMarked = '8/*@case 04.04.division*//2';
  const additionMarked = '1+/*@case 04.04.addition*/+2';
  assert.equal(vm.runInNewContext(divisionMarked), 4);
  assert.equal(vm.runInNewContext(additionMarked), 3);
  assert.equal(await fingerprint(divisionMarked), await fingerprint('8/2'));
  assert.equal(await fingerprint(additionMarked), await fingerprint('1+ +2'));
});

// Identidade de execução: cada campo lido pelo executor deve alterar o fingerprint; ordem de chaves e de
// listas de arquivos não deve; campos editoriais não devem.
const fingerprintApi = load();
const fpFiles = [{path: 'main.ts', content: 'export const v: number = 1;'}, {path: 'tests/a.test.ts', content: 'test("a", () => {});'}];
function richAssessment() {
  return {
    environment: 'typescript', version: 2, checks: ['types', 'behavior', 'mutation'],
    entryPath: 'main.ts', typeEntryPath: 'types/entry.ts', testPath: '__devpath_tests__.js',
    testPaths: ['tests/a.test.ts', 'tests/b.test.ts'], tests: 'test("x", () => {});', sourceTestPath: 'tests/source.test.js',
    referenceDir: 'solutions/x', tsconfigPath: 'tsconfig.json', fixturesPath: 'fixtures/x.json',
    fixtures: {html: '<main id="out"></main>', entryPath: 'index.html', workerEntries: ['worker.js'], network: [{url: '/api', status: 200, body: '{}'}]},
    inlinefixtures: {'data.json': '{"a":1}'}, timeoutMs: 1500,
    argv: ['node-simulated', 'main.js', '--flag'], env: {MODE: 'test', LANG: 'pt-BR'}, virtualCwd: '/project', runtime: 'node-simulated',
    studentSuite: true, studentSuiteKind: 'runtime', behaviorTestPath: 'tests/behavior.test.js', typecheckMutants: true,
    expectedDiagnostics: [{code: 2322, file: 'main.ts', line: 1}, {code: 2345, file: 'main.ts', line: 2}],
    local: {commands: [['npm', 'test'], ['npm', 'run', 'lint']], evidence: ['relatório de testes']},
    rubric: ['critério um', 'critério dois'],
    transfer: {id: 'variant-a', files: [{path: 'transfer.ts', content: 'export const t = 1;'}], testPath: 'tests/transfer.test.ts', rubric: ['transferir']},
    correctFiles: [{path: 'main.ts', content: 'export const v: number = 1;'}, {path: 'util.ts', content: 'export const u = 1;'}],
    mutantDirs: [{id: 'm1', files: [{path: 'main.ts', content: 'export const v: number = 2;'}]}],
    contractTypeFiles: [{path: 'contract.ts', content: 'const x: number = 1;'}],
    typeContractMutants: [{id: 'tc1', files: [{path: 'contract.ts', content: 'const x: string = "";'}]}],
  };
}
const fp = (overrides = {}) => fingerprintApi.canonicalFingerprint({activityId: '04.04', contentVersion: 1, assessmentVersion: 1, files: fpFiles, assessment: richAssessment(), variantId: null, ...overrides});

// Cada mutação altera exatamente um campo efetivo e deve mudar o fingerprint.
const fieldMutations = [
  ['environment', a => { a.environment = 'dom'; }],
  ['version', a => { a.version = 3; }],
  ['checks (conjunto)', a => { a.checks = ['types', 'behavior']; }],
  ['entryPath', a => { a.entryPath = 'other.ts'; }],
  ['typeEntryPath', a => { a.typeEntryPath = 'types/other.ts'; }],
  ['testPath', a => { a.testPath = 'tests/other.js'; }],
  ['testPaths (conteúdo da lista)', a => { a.testPaths = ['tests/a.test.ts', 'tests/c.test.ts']; }],
  ['tests (conteúdo do teste protegido)', a => { a.tests = 'test("x", () => { throw new Error(); });'; }],
  ['sourceTestPath', a => { a.sourceTestPath = 'tests/other.test.js'; }],
  ['referenceDir', a => { a.referenceDir = 'solutions/y'; }],
  ['tsconfigPath', a => { a.tsconfigPath = 'tsconfig.strict.json'; }],
  ['fixturesPath', a => { a.fixturesPath = 'fixtures/y.json'; }],
  ['fixtures.html', a => { a.fixtures.html = '<main></main>'; }],
  ['fixtures.workerEntries', a => { a.fixtures.workerEntries = ['worker2.js']; }],
  ['fixtures.network (status)', a => { a.fixtures.network[0].status = 503; }],
  ['inlinefixtures', a => { a.inlinefixtures = {'data.json': '{"a":2}'}; }],
  ['timeoutMs', a => { a.timeoutMs = 1600; }],
  ['argv (valor)', a => { a.argv = ['node-simulated', 'main.js', '--other']; }],
  ['env', a => { a.env = {MODE: 'prod', LANG: 'pt-BR'}; }],
  ['virtualCwd', a => { a.virtualCwd = '/other'; }],
  ['runtime', a => { a.runtime = 'browser'; }],
  ['studentSuite', a => { a.studentSuite = false; }],
  ['studentSuiteKind', a => { a.studentSuiteKind = 'types'; }],
  ['behaviorTestPath', a => { a.behaviorTestPath = 'tests/other.test.js'; }],
  ['typecheckMutants', a => { a.typecheckMutants = false; }],
  ['expectedDiagnostics', a => { a.expectedDiagnostics = [{code: 2322, file: 'main.ts', line: 1}]; }],
  ['local.commands', a => { a.local.commands = [['npm', 'test']]; }],
  ['local.evidence', a => { a.local.evidence = ['outra evidência']; }],
  ['rubric', a => { a.rubric = ['critério um', 'critério três']; }],
  ['transfer.id', a => { a.transfer.id = 'variant-b'; }],
  ['transfer.files (conteúdo)', a => { a.transfer.files[0].content = 'export const t = 2;'; }],
  ['transfer.testPath', a => { a.transfer.testPath = 'tests/other-transfer.test.ts'; }],
  ['transfer.rubric', a => { a.transfer.rubric = ['outro critério']; }],
  ['correctFiles (conteúdo)', a => { a.correctFiles[0].content = 'export const v: number = 9;'; }],
  ['correctFiles (caminho)', a => { a.correctFiles[1].path = 'util2.ts'; }],
  ['correctFiles (arquivo extra)', a => { a.correctFiles.push({path: 'extra.ts', content: ''}); }],
  ['mutantDirs (conteúdo)', a => { a.mutantDirs[0].files[0].content = 'export const v: number = 3;'; }],
  ['mutantDirs (id)', a => { a.mutantDirs[0].id = 'm-renamed'; }],
  ['mutantDirs (mutante extra)', a => { a.mutantDirs.push({id: 'm2', files: [{path: 'main.ts', content: 'x'}]}); }],
  ['contractTypeFiles (conteúdo)', a => { a.contractTypeFiles[0].content = 'const x: number = 2;'; }],
  ['typeContractMutants (conteúdo)', a => { a.typeContractMutants[0].files[0].content = 'const x: boolean = true;'; }],
  ['typeContractMutants (id)', a => { a.typeContractMutants[0].id = 'tc-renamed'; }],
  ['predictionTable (campos e instruções que definem respostas)', a => { a.predictionTable = {version: 2, instructions: 'Outra previsão', fields: [{id: 'other', label: 'Outro'}]}; }],
];
for (const [label, mutate] of fieldMutations) {
  test(`fingerprint muda quando muda: ${label}`, async () => {
    const base = await fp();
    const assessment = richAssessment();
    mutate(assessment);
    assert.notEqual(await fp({assessment}), base, label);
  });
}

test('fingerprint muda com versões, atividade, variante e conteúdo do aluno', async () => {
  const base = await fp();
  assert.notEqual(await fp({contentVersion: 2}), base, 'contentVersion');
  assert.notEqual(await fp({assessmentVersion: 2}), base, 'assessmentVersion');
  assert.notEqual(await fp({activityId: '04.05'}), base, 'activityId');
  assert.notEqual(await fp({variantId: 'variant-a'}), base, 'variantId ausente x presente');
  assert.notEqual(await fp({variantId: 'variant-a'}), await fp({variantId: 'variant-b'}), 'variantId distinto');
  assert.notEqual(await fp({files: [{path: 'main.ts', content: 'export const v: number = 2;'}, fpFiles[1]]}), base, 'conteúdo do arquivo do aluno');
  assert.notEqual(await fp({files: [fpFiles[0]]}), base, 'arquivo removido');
  assert.notEqual(await fp({files: [...fpFiles, {path: 'extra.ts', content: ''}]}), base, 'arquivo acrescentado');
});

test('fingerprint é idêntico para entradas idênticas e não depende da ordem das chaves', async () => {
  const base = await fp();
  assert.equal(await fp(), base, 'mesmas entradas, nova construção');
  const reversed = value => {
    if (Array.isArray(value)) return value.map(reversed);
    if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).reverse().map(key => [key, reversed(value[key])]));
    return value;
  };
  assert.equal(await fp({assessment: reversed(richAssessment())}), base, 'chaves em ordem inversa, em todos os níveis');
});

test('listas de arquivos são ordenadas por caminho e não dependem da ordem de entrada', async () => {
  const base = await fp();
  assert.equal(await fp({files: [...fpFiles].reverse()}), base, 'files');
  const reordered = richAssessment();
  reordered.correctFiles.reverse();
  assert.equal(await fp({assessment: reordered}), base, 'correctFiles em ordem invertida');
});

test('checks e expectedDiagnostics são ordem-independentes; argv, testPaths e rubric não', async () => {
  const base = await fp();
  const checks = richAssessment();
  checks.checks = [...checks.checks].reverse();
  assert.equal(await fp({assessment: checks}), base, 'checks (uso só por inclusão)');
  const diagnostics = richAssessment();
  diagnostics.expectedDiagnostics.reverse();
  assert.equal(await fp({assessment: diagnostics}), base, 'expectedDiagnostics (comparação ordenada)');
  const argv = richAssessment();
  argv.argv = ['main.js', 'node-simulated', '--flag'];
  assert.notEqual(await fp({assessment: argv}), base, 'argv depende da ordem');
  const testPaths = richAssessment();
  testPaths.testPaths.reverse();
  assert.notEqual(await fp({assessment: testPaths}), base, 'testPaths depende da ordem (ordem de importação)');
  const rubric = richAssessment();
  rubric.rubric.reverse();
  assert.notEqual(await fp({assessment: rubric}), base, 'rubric preserva a ordem exibida');
});

test('caminhos duplicados mantêm a ordem de entrada, porque o último arquivo vence', async () => {
  const first = await fp({files: [{path: 'main.ts', content: 'a'}, {path: 'main.ts', content: 'b'}]});
  const second = await fp({files: [{path: 'main.ts', content: 'b'}, {path: 'main.ts', content: 'a'}]});
  assert.notEqual(first, second);
});

test('ausente e undefined são equivalentes; vazio é valor presente e gera hash diferente', async () => {
  const base = await fp();
  const absent = richAssessment();
  delete absent.tests;
  delete absent.argv;
  const withUndefined = richAssessment();
  withUndefined.tests = undefined;
  withUndefined.argv = undefined;
  assert.equal(await fp({assessment: withUndefined}), await fp({assessment: absent}), 'undefined == ausente');
  assert.equal(await fp({variantId: undefined}), base, 'variantId ausente == null');
  assert.equal(await fp({files: undefined}), await fp({files: []}), 'files ausente == lista vazia');
  const withoutEnv = richAssessment();
  delete withoutEnv.env;
  assert.notEqual(await fp({assessment: withoutEnv}), await fp({assessment: {...richAssessment(), env: {}}}), 'env ausente != env vazio');
});

test('campos editoriais e chaves desconhecidas não alteram o fingerprint', async () => {
  const base = await fp();
  const editorial = richAssessment();
  editorial.prompt = 'Enunciado reescrito para o aluno.';
  editorial.title = 'Novo título';
  editorial.description = 'Nova descrição';
  editorial.transfer.prompt = 'Outro enunciado de transferência.';
  editorial.evidenceLabel = 'rubric-declared';
  editorial.evidenceNote = 'Texto de transparência revisado.';
  editorial.notes = 'nota interna';
  assert.equal(await fp({assessment: editorial}), base);
});

test('a allowlist cobre todas as chaves dos manifestos de origem e publicado', () => {
  const known = new Set([...fingerprintApi.fingerprintFields, ...fingerprintApi.editorialFields]);
  const transferKnown = new Set(['id', 'files', 'testPath', 'rubric', 'prompt']);
  const missing = [];
  for (const file of ['course-src/assessments.json', 'public/course-assessments.json']) {
    const manifest = JSON.parse(readFileSync(file, 'utf8'));
    for (const [id, assessment] of Object.entries(manifest)) {
      if (id === '_comment') continue;
      for (const key of Object.keys(assessment)) if (!known.has(key)) missing.push(`${file} ${id}.${key}`);
      for (const key of Object.keys(assessment.transfer || {})) if (!transferKnown.has(key)) missing.push(`${file} ${id}.transfer.${key}`);
    }
  }
  assert.deepEqual(missing, [], 'toda chave nova precisa ser classificada como execução ou editorial');
});

test('a mesma tentativa com variante de transferência não reutiliza a prova da atividade original', async () => {
  assert.notEqual(await fp({variantId: null}), await fp({variantId: 'variant-a'}));
});

test('fingerprint rejeita arquivos que não são lista', async () => {
  await assert.rejects(() => fingerprintApi.canonicalFingerprint({activityId: '04.04', files: 'main.ts', assessment: richAssessment()}), /lista/);
});

test('adicionar o campo novo à allowlist não altera fingerprints históricos sem predictionTable', async () => {
  const assessment = richAssessment();
  delete assessment.predictionTable;
  assert.equal(await fp({assessment}), await fp({assessment: {...assessment, predictionTable: undefined}}));
});
