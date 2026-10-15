import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import * as esbuild from 'esbuild-wasm';
import {parse} from 'acorn';
import {setup} from './course-runner-harness.mjs';

const root = process.cwd();
const read = file => readFileSync(path.join(root, file), 'utf8');
const eolNormalized = text => String(text ?? '').replace(/\r\n/g, '\n');
const assessmentSource = read('course-src/assessments.json');
const assessments = JSON.parse(assessmentSource);
const suite = read('course-src/tests/21.04.test.js');
const workerSuite = read('course-src/tests/21.05.test.js');
const workerMain = read('course-src/solutions/21.05/main.js');
const workerAssessment = assessments['21.05'];
const workerTargetFiles = ['main.js', 'worker.js', 'primos.js'].map(name => ({
  path: name,
  content: read(`course-src/solutions/21.05/${name}`),
}));
const workerTestFile = {path: 'tests/21.05.test.js', content: workerSuite};
const workerMutants = workerAssessment.mutantDirs.map(mutant => ({
  id: mutant.id,
  files: mutant.files.map(file => ({...file})),
}));

assert.equal(assessments['21.04'].entryPath, 'memo.js');
assert.equal(assessments['21.04'].environment, 'javascript');
assert.equal(eolNormalized(assessments['21.04'].tests), eolNormalized(suite).trimEnd());
assert.equal((suite.match(/\btest\(/g) || []).length, 5);
assert.match(suite, /memoizeLRU\(value =>.*?, 3\)/);
assert.match(suite, /expect\(memoized\(third\)\)\.toBe\('third'\)/);
assert.match(suite, /expect\(calls\)\.toBe\(5\)/);
assert.equal(assessments['21.05'].entryPath, 'main.js');
assert.equal(assessments['21.05'].environment, 'dom');
assert.equal(eolNormalized(assessments['21.05'].tests), eolNormalized(workerSuite).trimEnd());
assert.deepEqual(assessments['21.05'].fixtures.workerEntries, ['worker.js']);
assert.deepEqual(new Set(workerTargetFiles.map(file => file.path)), new Set(['main.js', 'worker.js', 'primos.js']));
assert.match(workerSuite, /import\s*\{\s*calcular,\s*encerrar\s*\}\s*from\s*['"]\.\.\/main\.js['"]/);
assert.match(workerSuite, /Object\.getPrototypeOf\(exposedPrototype\)\.constructor/);
assert.match(workerSuite, /nativePostMessage\.call\(this, message/);
assert.match(workerSuite, /encerrar\(\);\s*encerrar\(\);/);
assert.match(workerSuite, /finally\s*\{/);
assert.match(workerSuite, /new Uint8Array\(N \+ 1\)\.fill\(1\)/);
assert.match(workerSuite, /Array\.from\(\{length: 1501\}/);
assert.match(workerSuite, /expected\.slice\(0, 1501\)/);
assert.match(workerSuite, /seed = \(seed \* 48271\) % 2147483647/);
assert.match(workerSuite, /contarPrimos\(N\)\)\.toBe\(expected\[N\]\)/);
for (const invalid of ['NaN', 'Infinity', "'10'", '-1', '2.5']) {
  assert(workerSuite.includes(`contarPrimos(${invalid})`), `A suíte ativa perdeu a entrada inválida ${invalid}`);
}
assert.match(workerSuite, /\[6200, 1976, 13815, 2677, 15038, 15794, 4350, 13141, 5812, 9009, 16689, 19503\]/);
assert.match(workerMain, /worker === null\) return Promise\.resolve\(\)\.then\(\(\) => contarPrimos\(n\)\)/);

function installModuleGraph(window) {
  vm.runInThisContext(`(function(window){${read('public/module-graph.js')}\n})`)(window);
}

// Default placement mirrors public/course-assessment.js: the protected suite runs at behaviorTestPath (project root).
async function runJavascriptSuite(testContent, implementation, records = [], testPath = assessments['21.04'].behaviorTestPath) {
  const environment = setup();
  try {
    installModuleGraph(environment.w);
    const files = [
      ...implementation,
      {path: testPath, content: testContent},
    ];
    const graph = await environment.w.DevPathModuleGraph.buildModuleGraph({
      files,
      entryPath: testPath,
      assertionCases: records,
    }, {build: esbuild.build, parse, transform: esbuild.transform});
    return await environment.runModule(graph, 8000, records);
  } finally {
    environment.close();
  }
}

function sourceFile(relativePath) {
  return {path: path.basename(relativePath), content: read(`course-src/${relativePath}`)};
}

const memoReference = [sourceFile('solutions/21.04/memo.js')];
const memoMutants = assessments['21.04'].mutantDirs.map(mutant => ({
  id: mutant.id,
  files: mutant.files.map(file => ({...file})),
}));

test('21.04 reference passes the LRU contract', async () => {
  const result = await runJavascriptSuite(suite, memoReference, assessments['21.04'].assertionCases);
  assert.equal(result.kind, 'result', result.text);
  assert.equal(result.tests.failed, 0, result.tests.text);
  assert.equal(result.tests.total, 5);
});

for (const mutant of memoMutants) {
  test(`21.04 mutant ${mutant.id} is rejected by the new suite`, async () => {
    const implementation = memoReference.map(file => ({...file}));
    for (const file of mutant.files) implementation.splice(implementation.findIndex(candidate => candidate.path === file.path), 1, file);
    const result = await runJavascriptSuite(suite, implementation, assessments['21.04'].assertionCases);
    assert.equal(result.kind, 'result', result.text);
    assert(result.tests.failed > 0, `${mutant.id} survived the new assertions`);
  });
}

test('the immutable old 21.04 suite survives fn-throw-poisons-cache', async () => {
  const historical = read('output/fase2/workers/21.04.old.test.js');
  const poison = memoMutants.find(mutant => mutant.id === 'fn-throw-poisons-cache');
  assert(poison);
  const implementation = memoReference.map(file => ({...file}));
  for (const file of poison.files) implementation.splice(implementation.findIndex(candidate => candidate.path === file.path), 1, file);
  const result = await runJavascriptSuite(historical, implementation, [], '__devpath_old_21_04_tests__.js');
  assert.equal(result.kind, 'result', result.text);
  assert.equal(result.tests.failed, 0, result.tests.text);
  assert(result.tests.total > 0);
});

test('21.05 async fallback works when Worker is unavailable', async () => {
  const fallbackSuite = `import {calcular, encerrar} from '../main.js';
test('fallback runs asynchronously and preserves errors/closed state', async () => {
  let settled = false;
  const pending = calcular(10).then(value => { settled = true; return value; });
  expect(settled).toBe(false);
  expect(await pending).toBe(4);
  const invalid = await calcular(-1).then(() => null, error => error);
  expect(invalid instanceof RangeError).toBe(true);
  encerrar();
  const closed = await calcular(2).then(() => null, error => error.message);
  expect(closed).toBe('Worker encerrado.');
});`;
  const result = await runJavascriptSuite(fallbackSuite, [
    sourceFile('solutions/21.05/main.js'),
    sourceFile('solutions/21.05/primos.js'),
  ], [], 'tests/worker-fallback.test.js');
  assert.equal(result.kind, 'result', result.text);
  assert.equal(result.tests.failed, 0, result.tests.text);
  assert.equal(result.tests.total, 1);
});

const outputPath = path.join(root, 'output', 'fase2', 'workers', 'task7-browser-check.js');
const browserInput = {
  id: '21.05',
  assessment: {
    environment: workerAssessment.environment,
    entryPath: workerAssessment.entryPath,
    testPath: workerAssessment.testPath,
    fixtures: workerAssessment.fixtures,
    timeoutMs: workerAssessment.timeoutMs,
    assertionCases: workerAssessment.assertionCases,
  },
  files: [...workerTargetFiles, workerTestFile],
  correctFiles: workerTargetFiles,
  mutants: workerMutants,
  oldSuite: read('output/fase2/workers/21.05.old.test.js'),
};
const browserCode = `async page => {
  const input = ${JSON.stringify(browserInput)};
  await page.waitForFunction(() => Boolean(window.DevPathDomRunner?.run), undefined, {timeout: 30000});
  return await page.evaluate(async input => {
    const graphCalls = [];
    const originalGraph = window.DevPathModuleGraph;
    window.DevPathModuleGraph = Object.freeze({...originalGraph, buildModuleGraph: async spec => {
      graphCalls.push({entryPath: spec.entryPath, caseCount: spec.assertionCases?.length || 0, caseIds: [...new Set((spec.assertionCases || []).map(record => record.id))]});
      return originalGraph.buildModuleGraph(spec);
    }});
    const execute = async (files, testPath = input.assessment.testPath) => window.DevPathDomRunner.run({
      files,
      entryPath: input.assessment.entryPath,
      testPaths: [testPath],
      fixtures: input.assessment.fixtures,
      assertionCases: input.assessment.assertionCases,
    }, {timeoutMs: input.assessment.timeoutMs, assertionCases: input.assessment.assertionCases});
    const reference = await execute(input.files);
    const mutants = [];
    for (const mutant of input.mutants) {
      const byPath = new Map(input.files.map(file => [file.path, file]));
      for (const file of mutant.files) byPath.set(file.path, file);
      mutants.push({id: mutant.id, result: await execute([...byPath.values()])});
    }
    const oldTestPath = '__devpath_old_21_05_tests__.js';
    const oldFiles = [...input.correctFiles, {path: oldTestPath, content: input.oldSuite}];
    const oldReference = await execute(oldFiles, oldTestPath);
    const cleanup = input.mutants.find(mutant => mutant.id === 'cleanup-without-terminate');
    const oldCleanupByPath = new Map(oldFiles.map(file => [file.path, file]));
    for (const file of cleanup.files) oldCleanupByPath.set(file.path, file);
    const oldCleanup = await execute([...oldCleanupByPath.values()], oldTestPath);
    const infrastructureKinds = new Set(['unsupported', 'timeout', 'error', 'cancelled']);
    const infrastructure = infrastructureKinds.has(reference.kind)
      ? {area: 'reference', kind: reference.kind, text: reference.text}
      : mutants.find(item => infrastructureKinds.has(item.result.kind))
        ? {area: 'mutant', ...mutants.find(item => infrastructureKinds.has(item.result.kind))}
        : null;
    const failures = [];
    if (reference.kind !== 'passed' || !reference.tests || reference.tests.total < 1 || reference.tests.failed) failures.push('reference');
    if (oldReference.kind !== 'passed' || !oldReference.tests?.total || oldReference.tests.failed) failures.push('old-reference');
    if (oldCleanup.kind !== 'passed' || !oldCleanup.tests?.total || oldCleanup.tests.failed) failures.push('old-suite-killed-cleanup-mutant');
    if (!graphCalls.some(call => call.entryPath === 'worker.js' && call.caseIds.includes('21.05.real-worker-response-ids'))) failures.push('worker-assertion-cases-not-forwarded');
    for (const mutant of mutants) if (mutant.result.kind !== 'failed' || !mutant.result.tests?.failed) failures.push(mutant.id);
    const expectedTest = new Map([
      ['cleanup-without-terminate', 'closing terminates once, rejects pending work, and rejects future work'],
      ['response-ignores-id', 'native Worker message IDs route out-of-order responses to their own promises'],
    ]);
    for (const mutant of mutants) {
      const testName = expectedTest.get(mutant.id);
      if (testName && mutant.result.tests?.firstFailure?.testName !== testName) failures.push(mutant.id + ':wrong-test');
    }
    return {
      id: input.id,
      browser: navigator.userAgent,
      workerConstructor: typeof Worker,
      infrastructure,
      workerGraph: graphCalls.filter(call => call.entryPath === 'worker.js'),
      reference: {kind: reference.kind, tests: reference.tests, text: reference.text},
      historical: {
        oldReference: {kind: oldReference.kind, tests: oldReference.tests, text: oldReference.text},
        oldCleanupMutant: {kind: oldCleanup.kind, tests: oldCleanup.tests, text: oldCleanup.text},
      },
      mutants: mutants.map(item => ({id: item.id, kind: item.result.kind, tests: item.result.tests, text: item.result.text})),
      passed: !infrastructure && failures.length === 0,
      failures,
    };
  }, input);
}`;
writeFileSync(outputPath, `${browserCode}\n`, 'utf8');
console.log(`Browser check prepared at ${path.relative(root, outputPath)}; execute it with the Task 7 Playwright CLI session after the site assets are wired.`);
