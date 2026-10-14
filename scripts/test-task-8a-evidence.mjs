import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {after, test} from 'node:test';
import vm from 'node:vm';
import * as esbuild from 'esbuild-wasm';
import {parse} from 'acorn';
import {setup} from './course-runner-harness.mjs';

after(() => esbuild.stop());

const root = process.cwd();
const catalog = JSON.parse(readFileSync(join(root, 'public/course-catalog.json'), 'utf8'));
const assessments = JSON.parse(readFileSync(join(root, 'public/course-assessments.json'), 'utf8'));
const publishedTests = JSON.parse(readFileSync(join(root, 'public/course-tests.json'), 'utf8'));
const baselineCatalog = JSON.parse(readFileSync(join(root, 'output/fase2/catalog-before.json'), 'utf8'));
const task2Report = readFileSync(join(root, 'output/fase2/task2-report.md'), 'utf8');
const requestedActivity = process.env.DEVPATH_TASK8_ACTIVITY;
const phase2ActivityIds = new Set(baselineCatalog.map(item => item.id));
const target = catalog.filter(item => ['11', '12', '13', '14'].includes(item.stage)
  && (requestedActivity ? item.id === requestedActivity : phase2ActivityIds.has(item.id)));
const observationalStarterPassKinds = new Map([
  ['11.01', 'TRACE'], ['11.11', 'COMPARE'], ['11.14', 'COMPARE'],
  ['12.11', 'INVESTIGATE'], ['12.14', 'PREDICT'],
]);
const assessmentSource = readFileSync(join(root, 'public/course-assessment.js'), 'utf8');
const moduleGraph = (() => {
  const w = {TextEncoder};
  w.window = w;
  globalThis.__task8aModuleGraphWindow = w;
  vm.runInThisContext('(function(window){' + readFileSync(join(root, 'public/module-graph.js'), 'utf8') + '})(globalThis.__task8aModuleGraphWindow)', {filename: 'module-graph.js'});
  delete globalThis.__task8aModuleGraphWindow;
  return w.DevPathModuleGraph;
})();

const codeFile = file => /\.(?:m?js|jsx|ts|tsx|json|html?|css)$/.test(file.path);
const collect = directory => readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
  const relative = entry.name;
  const path = join(directory, entry.name);
  return entry.isDirectory()
    ? collect(path).map(([nested, content]) => [`${relative}/${nested}`, content])
    : codeFile({path: relative}) ? [[relative.replaceAll('\\', '/'), readFileSync(path, 'utf8')]] : [];
});
const filesIn = directory => collect(directory).map(([path, content]) => ({path, content}));
const starterFiles = item => item.starterFiles.filter(codeFile);

function preserveUnchangedExports(mutant, reference) {
  if (mutant.path !== 'main.js' || !reference) return mutant;
  const mutantAst = parse(mutant.content, {sourceType: 'module', ecmaVersion: 'latest'});
  const referenceAst = parse(reference.content, {sourceType: 'module', ecmaVersion: 'latest'});
  const declaredExports = ast => new Set(ast.body.flatMap(node => {
    if (node.type !== 'ExportNamedDeclaration' || !node.declaration) return [];
    const declaration = node.declaration;
    if (declaration.id?.name) return [declaration.id.name];
    return (declaration.declarations || []).flatMap(item => item.id?.name ? [item.id.name] : []);
  }));
  const mutantExports = declaredExports(mutantAst);
  const missing = referenceAst.body.filter(node => {
    if (node.type !== 'ExportNamedDeclaration' || !node.declaration) return false;
    const declaration = node.declaration;
    const names = declaration.id?.name ? [declaration.id.name] : (declaration.declarations || []).map(item => item.id?.name).filter(Boolean);
    return names.length > 0 && names.every(name => !mutantExports.has(name));
  });
  if (!missing.length) return mutant;
  const unrelatedExports = missing.map(node => reference.content.slice(node.start, node.end));
  return {...mutant, content: `${mutant.content}\n${unrelatedExports.join('\n')}\n`};
}

async function assessmentContext(env) {
  env.w.eval(readFileSync(join(root, 'public/course-node-runtime.js'), 'utf8'));
  env.w.Headers ||= globalThis.Headers;
  env.w.Response ||= globalThis.Response;
  env.w.Blob ||= globalThis.Blob;
  env.w.eval(readFileSync(join(root, 'public/course-network.js'), 'utf8'));
  const w = {TextEncoder, DevPathNodeRuntime: env.w.DevPathNodeRuntime, DevPathModuleGraph: {buildModuleGraph: input => moduleGraph.buildModuleGraph(input, {build: esbuild.build, parse, transform: esbuild.transform, runtime: input.runtime})}};
  w.window = w;
  w.DevPathCourseRunner = {run(code, finish) {
    let stopped = false;
    env.run(code).then(result => { if (!stopped) finish(result.kind, result.text, result.tests); });
    return () => { stopped = true; finish('cancelled', 'cancelled'); };
  }};
  w.DevPathDomRunner = {run: async (spec, options = {}) => {
    const browserGlobals = ['document', 'window', 'FormData', 'Node', 'Element', 'Event', 'MouseEvent', 'WheelEvent', 'KeyboardEvent', 'AbortController', 'AbortSignal'];
    const savedGlobals = new Map([...browserGlobals, 'Response', 'Headers', 'Blob', 'fetch'].map(name => [name, globalThis[name]]));
    for (const name of browserGlobals) globalThis[name] = env.w[name];
    const runtime = env.w.DevPathTestRuntime.createTestRuntime({target: globalThis});
    let network;
    try {
      runtime.install(globalThis);
      const htmlFile = spec.files.find(file => file.path === spec.entryPath && /\.html?$/i.test(file.path)) || spec.files.find(file => /\.html?$/i.test(file.path));
      env.w.document.body.innerHTML = htmlFile?.content || spec.fixtures?.html || '';
      const codeFiles = spec.files.filter(file => /\.(?:m?js|jsx|ts|tsx|json)$/i.test(file.path));
      const networkFixture = spec.fixtures?.network || spec.fixtures?.responses;
      if (networkFixture) {
        const routes = Array.isArray(networkFixture) ? networkFixture : networkFixture.routes || [];
        network = env.w.DevPathNetwork.createNetworkFixtures(routes);
        globalThis.fetch = env.w.fetch = network.fetch;
        globalThis.Response = env.w.Response;
        globalThis.Headers = env.w.Headers;
        globalThis.Blob = env.w.Blob;
      }
      const matchedAssessment = Object.values(assessments).find(candidate => candidate.tests === spec.testCode);
      const cases = options.assertionCases || spec.assertionCases || matchedAssessment?.assertionCases || [];
      const recordedTestPath = cases[0]?.sourceTestPath;
      const sourceTest = spec.files.find(file => (spec.testPaths || []).includes(file.path));
      const testPath = recordedTestPath || sourceTest?.path || '__devpath_dom_tests__.js';
      const entryPath = spec.fixtures?.entryPath || spec.entryPath;
      const testContent = recordedTestPath
        ? (sourceTest?.content || spec.testCode || '').replace(/((?:from|import)\s*["'])\.\/(?!\.)/g, '$1../')
        : spec.testCode || '';
      const testImportsImplementation = /(?:from|import)\s*["'](?:\.\/|\.\.\/)/.test(testContent);
      const entryImport = testPath.includes('/') ? `../${entryPath}` : `./${entryPath}`;
      const importLine = recordedTestPath && testImportsImplementation ? '' : `import ${JSON.stringify(entryImport)};\n`;
      const graph = await w.DevPathModuleGraph.buildModuleGraph({files: [...codeFiles.filter(file => file.path !== testPath && file.path !== sourceTest?.path), {path: testPath, content: `${importLine}${testContent}`}], entryPath: testPath, assertionCases: cases});
      await import('data:text/javascript;base64,' + Buffer.from(graph.code).toString('base64') + `#${randomUUID()}`);
      const tests = await runtime.run();
      return {kind: tests.failed ? 'failed' : 'passed', text: tests.text, tests};
    } catch (error) { w.__lastDomFailure = error instanceof Error ? error.stack || error.message : String(error); return {kind: 'error', text: w.__lastDomFailure, tests: {passed: 0, failed: 1, total: 1}}; }
    finally { network?.dispose(); runtime.restore(globalThis); for (const [name, value] of savedGlobals) globalThis[name] = value; }
  }};
  vm.runInNewContext(assessmentSource, w, {filename: 'course-assessment.js'});
  return w;
}

async function runOne(item) {
  const assessment = assessments[item.id];
  const base = {id: item.id, kind: item.kind, environment: assessment.environment, transfer: assessment.transfer};
  if (!item.autoTested) {
    return {...base, source: `${assessment.environment}-declared`, declared: assessment.rubric || assessment.local?.evidence || [], starter: null, reference: null, mutants: []};
  }
  const solutionDir = join(root, 'course-src', assessment.referenceDir);
  assert.ok(existsSync(solutionDir), `missing solution for ${item.id}`);
  const reference = filesIn(solutionDir);
  const implementationReference = reference.filter(file => !(assessment.testPaths || []).includes(file.path) && !/(?:^|\/)(?:test|tests)\//i.test(file.path) && !/\.(?:test|spec)\.[cm]?[jt]sx?$/i.test(file.path));
  const mutationReference = item.id === '11.08'
    ? [...implementationReference, ...starterFiles(item).filter(file => /\.(?:html?|css)$/i.test(file.path))]
    : implementationReference;
  const mutantRoot = join(root, 'course-src', 'mutants', item.id);
  const mutantDirs = existsSync(mutantRoot) ? readdirSync(mutantRoot, {withFileTypes: true}).filter(entry => entry.isDirectory()).map(entry => ({
    id: entry.name,
    files: filesIn(join(mutantRoot, entry.name)).map(file => item.id === '11.01' && file.path === 'main.js'
      ? preserveUnchangedExports(file, reference.find(candidate => candidate.path === 'main.js'))
      : file),
  })) : [];
  const env = setup();
  try {
    const w = await assessmentContext(env);
    const run = async files => {
      const result = await w.DevPathAssessment.run({item: {id: item.id}, assessment: {...assessment, correctFiles: implementationReference, mutantDirs}, files, fingerprint: `${item.id}:evidence`});
      return {kind: result.kind, text: result.text, tests: result.tests || null, source: result.source};
    };
    const starter = await run(starterFiles(item));
    const observationalStarter = observationalStarterPassKinds.get(item.id) === item.kind
      && (assessment.assertionCases || []).length > 0;
    const referenceFiles = new Map(reference.map(file => [file.path, file]));
    const solvedFiles = starterFiles(item).map(file => referenceFiles.get(file.path) || file);
    for (const file of reference) if (!solvedFiles.some(existing => existing.path === file.path)) solvedFiles.push(file);
    const solved = await run(solvedFiles);
    const learnerSuite = assessment.studentSuite
      ? reference.filter(file => (assessment.testPaths || []).includes(file.path))
      : [{path: '__assessment_suite__.test.js', content: publishedTests[item.id]}];
    const suiteAssessment = assessment.studentSuite ? assessment : {...assessment, studentSuite: true, testPath: learnerSuite[0]?.path, testPaths: learnerSuite.map(file => file.path)};
    const mutantResults = [];
    for (const mutant of mutantDirs) {
      const mutantEnv = setup();
      try {
        const mutantContext = await assessmentContext(mutantEnv);
        const killed = await mutantContext.DevPathAssessment.runStudentSuite({files: learnerSuite, correctFiles: mutationReference, mutantDirs: [mutant], assessment: suiteAssessment, fingerprint: `${item.id}:mutant:${mutant.id}`});
        const detail = mutantContext.__lastDomFailure ? `${killed.text}\n${mutantContext.__lastDomFailure}` : killed.text;
        mutantResults.push({id: mutant.id, result: {kind: killed.kind === 'passed' ? 'failed' : killed.kind, text: detail, tests: killed.tests || null, source: 'shared-node-harness', mutationOutcome: killed.kind === 'passed' ? 'killed' : 'not-killed'}});
      } finally { await mutantEnv.close(); }
    }
    const mutation = await w.DevPathAssessment.runStudentSuite({files: learnerSuite, correctFiles: mutationReference, mutantDirs, assessment: suiteAssessment, fingerprint: `${item.id}:mutation`});
    let implementationRegression = null;
    let htmlRegressions = null;
    if (item.id === '13.07') {
      const brokenClamp = starterFiles(item).map(file => file.path === 'clamp.js'
        ? {...file, content: 'export function clamp(valor, minimo, maximo) { if (minimo > maximo) throw new RangeError("intervalo inválido"); return valor; }'}
        : referenceFiles.get(file.path) || file);
      implementationRegression = await run(brokenClamp);
    }
    if (item.id === '11.08') {
      const html = solvedFiles.find(file => file.path === 'index.html')?.content;
      assert.equal(typeof html, 'string', '11.08 evidence must include submitted index.html');
      const variants = [
        ['missing column', html.replace(/<section aria-labelledby="done-title">[\s\S]*?<\/section>/, '')],
        ['missing form and live region', html.replace(/<form[\s\S]*?<\/form>/, '').replace(' aria-live="polite"', '')],
        ['missing label', html.replace('<label for="texto">Nova tarefa</label>', '')],
      ];
      htmlRegressions = {};
      for (const [name, markup] of variants) {
        const attempt = solvedFiles.map(file => file.path === 'index.html' ? {...file, content: markup} : file);
        htmlRegressions[name] = await run(attempt);
      }
    }
    return {...base, source: 'shared-node-harness', starter, starterExpectation: observationalStarter ? 'pass-published-observation' : 'fail-incomplete-implementation', reference: solved, mutants: mutantResults, mutation: {kind: mutation.kind, text: mutation.text, tests: mutation.tests || null}, ...(implementationRegression ? {implementationRegression} : {}), ...(htmlRegressions ? {htmlRegressions} : {})};
  } finally { await env.close(); }
}

const evidence = [];
for (const item of target) evidence.push(await runOne(item));

// Keep the expected executable set tied to the pre-Fase-2 catalog plus the
// activity-by-activity conversions recorded by Task 2, not a stale count.
const convertedIds = [...task2Report.matchAll(/^\|\s*(\d{2}\.\d{2})\s*\|[^\n]*\|\s*Convertida\s*\(/gm)].map(match => match[1]);
assert.equal(convertedIds.length, 15, 'Task 2 matrix must retain all 15 justified conversions');
const task2TargetConversions = convertedIds.filter(id => ['11', '12', '13', '14'].includes(id.split('.')[0]));
const baselineExecutableIds = baselineCatalog
  .filter(item => ['11', '12', '13', '14'].includes(item.stage) && item.autoTested)
  .map(item => item.id);
const expectedExecutableIds = [...new Set([...baselineExecutableIds, ...task2TargetConversions])].sort();

// Negative learner-suite cases exercise the published run() branch, not only
// the lower-level mutation helper. Declared test paths must win over references.
async function learnerSuiteNegative(id, source) {
  const item = catalog.find(candidate => candidate.id === id);
  const assessment = assessments[id];
  const solution = filesIn(join(root, 'course-src', assessment.referenceDir));
  const correctFiles = solution.filter(file => !(assessment.testPaths || []).includes(file.path) && !/(?:^|\/)(?:test|tests)\//i.test(file.path) && !/\.(?:test|spec)\.[cm]?[jt]sx?$/i.test(file.path));
  const mutantsDir = join(root, 'course-src', 'mutants', id);
  const mutantDirs = readdirSync(mutantsDir, {withFileTypes: true}).filter(entry => entry.isDirectory()).map(entry => ({id: entry.name, files: filesIn(join(mutantsDir, entry.name))}));
  const path = assessment.testPaths[0];
  const files = [...starterFiles(item).filter(file => file.path !== path && !/(?:^|\/)(?:test|tests)\//i.test(file.path) && !/\.(?:test|spec)\.[cm]?[jt]sx?$/i.test(file.path)), {path, content: source}];
  const env = setup();
  try {
    const w = await assessmentContext(env);
    const result = await w.DevPathAssessment.run({item: {id}, assessment: {...assessment, correctFiles, mutantDirs}, files, fingerprint: id + ':negative:' + randomUUID()});
    return {kind: result.kind, text: result.text, tests: result.tests || null};
  } finally { await env.close(); }
}
const negatives = {
  empty: await learnerSuiteNegative('13.03', ''),
  alwaysPassing: await learnerSuiteNegative('13.03', "test('no assertion', () => {});"),
  referenceFailing: await learnerSuiteNegative('13.03', "import {paginar} from './pagination.js'; test('wrong expectation', () => expect(paginar([1,2,3],1,2)).toEqual([99]));"),
};
assert.equal(negatives.empty.kind, 'failed', 'published pipeline accepted an empty learner test file');
assert.equal(negatives.alwaysPassing.kind, 'failed', 'published pipeline accepted an always-passing suite');
assert.equal(negatives.referenceFailing.kind, 'failed', 'published pipeline accepted a suite that fails on the correct implementation');
mkdirSync(join(root, 'output/learning-execution'), {recursive: true});
writeFileSync(join(root, 'output/learning-execution/task-8a-evidence.json'), JSON.stringify({scope: '11–14', generatedAt: new Date().toISOString(), negatives, activities: evidence}, null, 2) + '\n');
const executable = evidence.filter(entry => entry.starter);
const mutated = executable.filter(entry => entry.mutation?.kind === 'passed');
if (!requestedActivity) {
  assert.equal(evidence.length, 55);
  assert.deepEqual(executable.map(entry => entry.id).sort(), expectedExecutableIds, '11–14 executable evidence must equal baseline suites plus Task 2 conversions');
} else {
  assert.ok(target.some(item => item.id === requestedActivity), `unknown Task 8a activity: ${requestedActivity}`);
}
assert.equal(task2TargetConversions.length, 9, 'the Task 2 source matrix records nine conversions in stages 11–14');
assert.equal(mutated.length, executable.length, `every executable activity must kill all declared mutants; failures: ${executable.filter(entry => entry.mutation?.kind !== 'passed').map(entry => `${entry.id}: ${entry.mutation?.text || entry.mutation?.kind}`).join(' | ')}`);
for (const entry of executable) {
  if (entry.starterExpectation === 'pass-published-observation') {
    assert.equal(entry.starter.kind, 'passed', `${entry.id}: published observation should execute on the intentionally functional starter`);
    assert.ok(entry.starter.tests?.total > 0 && entry.starter.tests.failed === 0, `${entry.id}: starter observation did not pass its associated published cases`);
  } else {
    assert.notEqual(entry.starter.kind, 'passed', `${entry.id}: implementation starter unexpectedly passed`);
  }
  assert.equal(entry.reference.kind, 'passed', `${entry.id}: reference did not pass`);
  assert.equal(entry.mutation.kind, 'passed', `${entry.id}: mutation suite did not pass`);
  for (const mutant of entry.mutants) assert.ok(mutant.result.kind !== 'passed' || mutant.result.tests?.failed > 0, `${entry.id}: mutant ${mutant.id} survived`);
}
if (!requestedActivity || requestedActivity === '13.07') {
  const clampEvidence = evidence.find(entry => entry.id === '13.07');
  assert.equal(clampEvidence.implementationRegression.kind, 'failed', '13.07 accepted a broken submitted clamp with its learner suite');
  assert.match(clampEvidence.implementationRegression.text, /implementa[cç][aã]o enviada/i);
}
if (!requestedActivity || requestedActivity === '11.08') {
  const kanbanEvidence = evidence.find(entry => entry.id === '11.08');
  assert.deepEqual(Object.keys(kanbanEvidence.htmlRegressions).sort(), ['missing column', 'missing form and live region', 'missing label'].sort());
  for (const [name, result] of Object.entries(kanbanEvidence.htmlRegressions)) assert.equal(result.kind, 'failed', `11.08 accepted HTML with ${name}`);
}
test('Task 8A stages 11–14 evidence is complete', () => {
  assert.equal(evidence.length, requestedActivity ? 1 : 55);
  if (!requestedActivity) {
    assert.equal(executable.length, expectedExecutableIds.length, 'executable evidence must match the source-derived baseline plus conversions');
    assert.equal(mutated.length, expectedExecutableIds.length, 'every source-derived executable activity must kill its declared mutants');
  }
});
