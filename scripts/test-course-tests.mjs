import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import {after, test} from 'node:test';
import vm from 'node:vm';
import * as esbuild from 'esbuild-wasm';
import {parse} from 'acorn';
import {readFileSync as readTypescriptFile, readdirSync as readTypescriptDirectory, statSync as statTypescriptPath} from 'node:fs';
import {checkTypes} from './typecheck-host.mjs';
import {setup} from './course-runner-harness.mjs';

// Every activity with built-in tests must fail on its starter files and pass on
// the declared reference directory. Both runs use the same sandbox code as the site.
const catalog = JSON.parse(readFileSync('public/course-catalog.json', 'utf8'));
const tests = JSON.parse(readFileSync('public/course-tests.json', 'utf8'));
const assessments = JSON.parse(readFileSync('public/course-assessments.json', 'utf8'));
const observationalStarterPassKinds = new Map([
  ['04.01', 'PREDICT'], ['05.01', 'PREDICT'], ['06.01', 'PREDICT'], ['06.02', 'TRACE'],
  ['08.01', 'PREDICT'], ['08.07', 'TRACE'], ['09.01', 'TRACE'], ['09.04', 'TRACE'],
  ['10.01', 'PREDICT'], ['11.01', 'TRACE'], ['11.11', 'COMPARE'], ['11.14', 'COMPARE'],
  ['12.11', 'INVESTIGATE'], ['12.14', 'PREDICT'],
]);
// These exact objectives can pass their starter behavior checks by design:
// 18.10 replaces copied aliases with utility types that preserve the same types;
// 20.01 is a TRACE activity that records the iterator behavior already present;
// 23.04 characterizes legacy behavior and asks for a behavior-preserving refactor.
// This allowance covers functional behavior only; refactor structure remains a
// separate rubric/focused review criterion. Keep each expected kind explicit so
// an objective whose kind changes cannot silently inherit this exception.
const objectiveSpecificStarterPassKinds = new Map([
  ['18.10', 'MODIFY'],
  ['20.01', 'TRACE'],
  ['23.04', 'MODIFY'],
]);
for (const [id, kind] of objectiveSpecificStarterPassKinds) {
  const item = catalog.find(entry => entry.id === id);
  assert.ok(item?.autoTested, `${id}: objective-specific starter acceptance requires its autoTested gate`);
  assert.equal(item.kind, kind, `${id}: objective kind changed; revisit its bounded starter acceptance`);
}
const moduleGraph = (() => { const w = {TextEncoder}; w.window = w; vm.runInThisContext('(function(window){' + readFileSync('public/module-graph.js', 'utf8') + '})')(w); return w.DevPathModuleGraph; })();
const assessmentSource = readFileSync('public/course-assessment.js', 'utf8');
const typescriptLibraries = Object.fromEntries(readTypescriptDirectory('node_modules/typescript/lib')
  .filter(name => /^lib\..+\.d\.ts$/.test(name))
  .map(name => [`/node_modules/typescript/lib/${name}`, readTypescriptFile(`node_modules/typescript/lib/${name}`, 'utf8')]));
function addTypeDeclarations(directory, prefix) {
  for (const name of readTypescriptDirectory(directory)) {
    const local = `${directory}/${name}`;
    if (statTypescriptPath(local).isDirectory()) addTypeDeclarations(local, `${prefix}/${name}`);
    else if (name.endsWith('.d.ts') || name === 'package.json') typescriptLibraries[`${prefix}/${name}`] = readTypescriptFile(local, 'utf8');
  }
}
addTypeDeclarations('node_modules/@types/node', '/node_modules/@types/node');
addTypeDeclarations('node_modules/undici-types', '/node_modules/undici-types');

async function assessmentContext(env) {
  env.w.eval(readFileSync('public/course-node-runtime.js', 'utf8'));
  env.w.Headers ||= globalThis.Headers;
  env.w.Response ||= globalThis.Response;
  env.w.Blob ||= globalThis.Blob;
  env.w.eval(readFileSync('public/course-network.js', 'utf8'));
  const w = {TextEncoder, DevPathNodeRuntime: env.w.DevPathNodeRuntime, DevPathModuleGraph: {buildModuleGraph: input => moduleGraph.buildModuleGraph(input, {build: esbuild.build, parse, transform: esbuild.transform, runtime: input.runtime})}};
  w.window = w;
  w.DevPathTypeChecker = {async check(input) {
    const result = checkTypes(input, {libraries: typescriptLibraries});
    const errors = result.diagnostics.filter(diagnostic => diagnostic.category === 'error');
    const kind = !result.supported ? 'unsupported' : errors.length ? 'type-error' : 'passed';
    return {...result, kind, source: 'browser'};
  }};
  w.DevPathCourseRunner = {run(code, finish, options) { return env.w.DevPathCourseRunner.run(code, (kind, text, tests, node) => finish(kind, text, tests, node), options); }};
  w.DevPathDomRunner = {run: async (spec, options = {}) => {
    const browserGlobals = ['document', 'window', 'FormData', 'Node', 'Element', 'Event', 'MouseEvent', 'WheelEvent', 'KeyboardEvent', 'AbortController', 'AbortSignal'];
    const savedGlobals = new Map([...browserGlobals, 'Response', 'Headers', 'Blob'].map(name => [name, globalThis[name]]));
    for (const name of browserGlobals) globalThis[name] = env.w[name];
    const runtime = env.w.DevPathTestRuntime.createTestRuntime({target: globalThis});
    try {
      runtime.install(globalThis);
      const htmlFile = spec.files.find(file => file.path === spec.entryPath && /\.html?$/i.test(file.path)) || spec.files.find(file => /\.html?$/i.test(file.path));
      env.w.document.body.innerHTML = htmlFile?.content || spec.fixtures?.html || '';
      const codeFiles = spec.files.filter(file => /\.(?:m?js|jsx|ts|tsx|json)$/i.test(file.path));
      const matchedAssessment = Object.values(assessments).find(candidate => candidate.tests === spec.testCode);
      const cases = options.assertionCases || spec.assertionCases || matchedAssessment?.assertionCases || [];
      const recordedTestPath = cases[0]?.sourceTestPath;
      const sourceTest = spec.files.find(file => file.content === spec.testCode && /(?:^|\/)(?:test|tests)\//i.test(file.path))
        || spec.files.find(file => (spec.testPaths || []).includes(file.path));
      const testPath = spec.testPath || recordedTestPath || sourceTest?.path || '__devpath_dom_tests__.js';
      const entryPath = spec.fixtures?.entryPath || spec.entryPath;
      const scriptEntry = /\.html?$/i.test(entryPath || '') ? codeFiles.find(file => /\.m?js$/i.test(file.path))?.path : entryPath;
      const testContent = recordedTestPath
        ? (sourceTest?.content || spec.testCode || '').replace(/((?:from|import)\s*["'])\.\/(?!\.)/g, '$1../')
        : spec.testCode || '';
      const importLine = recordedTestPath ? '' : scriptEntry ? `import ${JSON.stringify(`./${scriptEntry}`)};\n` : '';
      const graph = await w.DevPathModuleGraph.buildModuleGraph({files: [...codeFiles.filter(file => file.path !== testPath && file.path !== sourceTest?.path), {path: testPath, content: `${importLine}${testContent}`}], entryPath: testPath, assertionCases: cases});
      await import('data:text/javascript;base64,' + Buffer.from(graph.code).toString('base64') + `#${randomUUID()}`);
      const result = await runtime.run();
      return {kind: result.failed ? 'failed' : 'passed', text: result.text, tests: result};
    } catch (error) { return {kind: 'error', text: error instanceof Error ? error.stack || error.message : String(error), tests: {passed: 0, failed: 1, total: 1}}; }
    finally { runtime.restore(globalThis); for (const [name, value] of savedGlobals) globalThis[name] = value; }
  }};
  vm.runInNewContext(assessmentSource, w);
  return w;
}

async function execute(env, files, id) {
  const assessment = assessments[id];
  if (id === '11.08' || assessment.studentSuite === true || assessment.environment === 'node-simulated' || assessment.checks.includes('types')) {
    const w = await assessmentContext(env);
    const result = await w.DevPathAssessment.run({item: {id}, assessment, files, fingerprint: `${id}:published-dom`});
    return {kind: result.kind === 'passed' ? 'result' : result.kind, text: result.text, tests: result.tests || null, diagnostics: result.diagnostics || []};
  }
  if (assessment.environment === 'dom' || assessment.environment === 'network') {
    const w = env.w;
    w.DevPathModuleGraph = {buildModuleGraph: input => moduleGraph.buildModuleGraph(input, {build: esbuild.build, parse, transform: esbuild.transform, runtime: input.runtime})};
    const browserGlobals = ['document', 'window', 'FormData', 'Node', 'Element', 'Event', 'MouseEvent', 'WheelEvent', 'KeyboardEvent', 'AbortController', 'AbortSignal'];
    const savedGlobals = new Map([...browserGlobals, 'Response', 'Headers', 'Blob'].map(name => [name, globalThis[name]]));
    for (const name of browserGlobals) globalThis[name] = w[name];
    const runtime = w.DevPathTestRuntime.createTestRuntime({target: globalThis});
    const savedFetch = globalThis.fetch;
    let network;
    try {
      runtime.install(globalThis);
      const htmlFile = files.find(file => file.path === assessment.entryPath && /\.html?$/i.test(file.path)) || files.find(file => /\.html?$/i.test(file.path));
      w.document.body.innerHTML = htmlFile?.content || assessment.fixtures?.html || '';
      if (assessment.environment === 'network') {
        w.Headers ||= globalThis.Headers;
        w.Response ||= globalThis.Response;
        w.Blob ||= globalThis.Blob;
        w.eval(readFileSync('public/course-network.js', 'utf8'));
        const routes = assessment.fixtures?.network || assessment.fixtures?.responses || [];
        network = w.DevPathNetwork.createNetworkFixtures(routes);
        globalThis.fetch = w.fetch = network.fetch;
        globalThis.Response = w.Response;
        globalThis.Headers = w.Headers;
        globalThis.Blob = w.Blob;
      }
      const codeFiles = files.filter(file => /\.(?:m?js|jsx|ts|tsx|json)$/.test(file.path));
      const testPath = assessment.testPath || '__devpath_dom_tests__.js';
      const entryPath = assessment.fixtures?.entryPath || assessment.entryPath;
      // An HTML entry is markup, not a module: the script that wires the page is the first code file (e.g. lab.js).
      const scriptEntry = /\.html?$/i.test(entryPath || '') ? codeFiles.find(file => /\.m?js$/i.test(file.path))?.path : entryPath;
      const importLine = scriptEntry ? `import ${JSON.stringify(`./${scriptEntry}`)};\n` : '';
      const graph = await w.DevPathModuleGraph.buildModuleGraph({files: [...codeFiles, {path: testPath, content: `${importLine}${assessment.tests}`}], entryPath: testPath, assertionCases: assessment.assertionCases || []});
      await import('data:text/javascript;base64,' + Buffer.from(graph.code).toString('base64') + `#${randomUUID()}`);
      const result = await runtime.run();
      return {kind: result.failed ? 'failed' : 'result', text: result.text, tests: result};
    } catch (error) {
      return {kind: 'error', text: error instanceof Error ? error.stack || error.message : String(error)};
    } finally { network?.dispose(); globalThis.fetch = savedFetch; runtime.restore(globalThis); for (const [name, value] of savedGlobals) globalThis[name] = value; }
  }
  const w = {TextEncoder, DevPathModuleGraph: {buildModuleGraph: (input) => moduleGraph.buildModuleGraph(input, {build: esbuild.build, parse, transform: esbuild.transform, runtime: input.runtime})}};
  w.window = w;
  w.DevPathCourseRunner = {run(code, finish) {
    let stopped = false;
    env.run(code).then(result => { if (!stopped) finish(result.kind, result.text, result.tests); });
    return () => { stopped = true; finish('cancelled', 'cancelled'); };
  }};
  vm.runInNewContext(assessmentSource, w);
  const result = await w.DevPathAssessment.run({item: {id}, assessment: id === '21.04'
    ? {...assessment, tests: assessment.tests.replaceAll('../memo.js', './memo.js'), testPath: '21.04.test.js'}
    : assessment, files, fingerprint: `${id}:fixture`});
  return {kind: result.kind === 'passed' ? 'result' : result.kind, text: result.text, tests: result.tests};
}

function collect(directory, prefix = '') {
  return readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const file = join(directory, entry.name);
    return entry.isDirectory() ? collect(file, relative) : [[relative, readFileSync(file, 'utf8')]];
  });
}

test('the published tests belong to flagged activities and the other way around', () => {
  // File-backed executable suites only: type-contract activities (no tests/<id> file) are verified by their contract mutants.
  const fileBacked = id => existsSync(join('course-src', 'tests', `${id}.test.js`)) || existsSync(join('course-src', 'tests', `${id}.types.ts`));
  const flagged = catalog.filter(item => item.autoTested && (assessments[item.id]?.checks || []).some(check => ['behavior', 'mutation', 'types'].includes(check)) && fileBacked(item.id)).map(item => item.id).sort();
  assert.deepEqual(Object.keys(tests).sort(), flagged);
  assert.ok(flagged.length > 0);
});

test('16–19 affected transfer cards have distinct scenarios, boundaries, and specific criteria', () => {
  const ids = ['16.02','16.03','16.04','16.05','16.06','16.07','16.08','16.09','16.10','17.03','17.04','17.05','17.06','17.07','17.08','18.03','18.04','18.05','18.07','18.08','18.10','19.03','19.04','19.05','19.08','19.09'];
  const contents = ids.map(id => {
    const transfer = assessments[id]?.transfer;
    assert.equal(transfer?.id, `${id}-transfer`, `${id}: transfer ID`);
    assert.equal(transfer?.files?.length, 1, `${id}: one transfer prompt`);
    const content = transfer.files[0].content;
    assert.ok(content.length > 180, `${id}: scenario is substantive`);
    assert.match(content, /(?:borda|limite)/i, `${id}: explicit boundary`);
    assert.match(content, /\d|["`]/, `${id}: concrete input or expected output`);
    assert.doesNotMatch(content, /Mostre uma variação com assinatura e dados concretos|Aplique os critérios a um caso independente/i, `${id}: generic fallback`);
    assert.ok(Array.isArray(transfer.rubric) && transfer.rubric.length >= 2, `${id}: specific scoring criteria`);
    for (const criterion of transfer.rubric) assert.ok(criterion.length >= 45, `${id}: criteria must be observable`);
    const reference = readFileSync(join('course-src', 'solutions', id, 'README.md'), 'utf8');
    assert.ok(reference.includes(content.replace(/^# Transferência \d+\.\d+\n\n/, '')), `${id}: reference explains this exact scenario`);
    return content;
  });
  assert.equal(new Set(contents).size, ids.length, 'each activity needs an independent scenario');
});

test('Fase 7: as referências dos 10 IDs passam e o avaliador rejeita seus mutantes publicados', async () => {
  const ids = ['15.02','15.03','15.04','15.07','15.08','15.11','16.02','16.03','16.04','16.05'];
  let exercised = 0;
  for (const id of ids) {
    const item = catalog.find(entry => entry.id === id);
    const source = assessments[id];
    assert.ok(item && source?.correctFiles?.length, `${id}: item e implementação de referência obrigatórios`);
    assert.ok(tests[id], `${id}: suíte publicada obrigatória`);
    const mutantCases = [
      ...(source.mutantDirs || []).map(mutant => ({field: 'mutantDirs', mutant})),
      ...(source.typeContractMutants || []).map(mutant => ({field: 'typeContractMutants', mutant})),
    ];
    assert.ok(mutantCases.length, `${id}: ao menos um mutante executável`);
    for (const {field, mutant} of mutantCases) {
      const env = setup();
      try {
        const w = await assessmentContext(env);
        const assessment = {
          ...source,
          tests: tests[id],
          mutantDirs: field === 'mutantDirs' ? [mutant] : source.mutantDirs || [],
          typeContractMutants: field === 'typeContractMutants' ? [mutant] : source.typeContractMutants || [],
        };
        const result = await w.DevPathAssessment.run({item, assessment, files: source.correctFiles, fingerprint: `${id}:fase7:${field}:${mutant.id}`});
        assert.equal(result.kind, 'passed', `${id}/${field}/${mutant.id}: referência e mutante devem satisfazer o contrato de avaliação; ${result.text}`);
        assert.equal(result.tests?.failed || 0, 0, `${id}/${field}/${mutant.id}: implementação correta deve passar`);
        exercised++;
      } finally { await env.close(); }
    }
  }
  assert.equal(exercised, 12, 'a lista atual contém 12 mutantes comportamentais/type-contract nos 10 IDs');
});

test('15.01 reports only the six published intentional diagnostics', async () => {
  const item = catalog.find(entry => entry.id === '15.01');
  const assessment = assessments['15.01'];
  const env = setup();
  try {
    const w = await assessmentContext(env);
    const result = await w.DevPathAssessment.run({item, assessment, files: item.starterFiles, fingerprint: '15.01:diagnostic-contract'});
    assert.equal(result.kind, 'passed', result.text);
    assert.deepEqual(result.diagnostics.map(d => [d.code, d.file, d.line]).sort(), [[2532,'diagnosticos.ts',12],[2322,'diagnosticos.ts',16],[18046,'diagnosticos.ts',23],[2540,'diagnosticos.ts',28],[2353,'diagnosticos.ts',32],[2366,'diagnosticos.ts',35]].sort());
  } finally { await env.close(); }
});

test('15.02 protected conformance tests reject a bad implementation and same-path always-pass edit', async () => {
  const id = '15.02';
  const item = catalog.find(entry => entry.id === id);
  const assessment = assessments[id];
  const env = setup();
  try {
    const reference = new Map(collect(join('course-src', assessment.referenceDir)));
    const files = item.starterFiles.filter(file => /\.(?:m?js|jsx|ts|tsx|json)$/.test(file.path)).map(file => {
      if (file.path === 'config.ts') return {path: file.path, content: `export type Config={port:number}; export function parseConfig(raw:unknown):Config { const value=(raw as {port?:unknown})?.port; return {port:Number(value ?? 3000)}; }`};
      return reference.has(file.path) ? {path: file.path, content: reference.get(file.path)} : file;
    });
    files.push({path: '__devpath_tests__.js', content: "import {test} from 'node:test'; test('always passes',()=>{});"});
    const w = await assessmentContext(env);
    const result = await w.DevPathAssessment.run({item, assessment, files, fingerprint: `${id}:protected-suite-regression`});
    assert.equal(result.kind, 'failed', result.text);
    assert.match(result.text, /testes comportamentais/i);
  } finally { await env.close(); }
});

test('15.03 protected type assertions reject any and incorrect public signatures', async () => {
  const id = '15.03';
  const item = catalog.find(entry => entry.id === id);
  const assessment = assessments[id];
  const env = setup();
  try {
    const reference = new Map(collect(join('course-src', assessment.referenceDir)));
    const base = item.starterFiles.filter(file => /\.(?:m?js|jsx|ts|tsx|json)$/.test(file.path)).map(file => reference.has(file.path) ? {path: file.path, content: reference.get(file.path)} : file);
    const w = await assessmentContext(env);
    for (const implementation of [
      `export type Usuario={nome:string;idade:number;criadoEm:string}; export function criarUsuario(nome:any,idade:any):any { const limpo=nome.trim(); return {nome:limpo,idade,criadoEm:new Date().toISOString()}; }`,
      `export type Usuario={nome:string;idade:number;criadoEm:string}; export function criarUsuario(nome:string,idade:string):Usuario { return {nome,idade,criadoEm:new Date().toISOString()}; }`,
    ]) {
      const files = base.map(file => file.path === 'usuario.ts' ? {path: file.path, content: implementation} : file);
      const result = await w.DevPathAssessment.run({item, assessment, files, fingerprint: `${id}:protected-types-regression`});
      assert.equal(result.kind, 'type-error', result.text);
      assert.ok(result.diagnostics.some(diagnostic => diagnostic.file === 'contracts/15.03.types.ts'));
    }
  } finally { await env.close(); }
});

test('15.02 and 15.07 protected assertions inspect exported signatures directly', async () => {
  const env = setup();
  try {
    for (const [id, changedFile, implementation] of [
      ['15.02', 'config.ts', `export type Config={port:number}; export function parseConfig(raw:any):any {return raw;}`],
      ['15.07', 'catalogo.ts', `export type Produto={nome:string;apelido?:string}; export function primeiroNome(lista:any):any{return lista[0];} export function semApelido(produto:any):any{return produto;} export function rotulo(produto:any):any{return produto;}`],
    ]) {
      const item = catalog.find(entry => entry.id === id);
      const assessment = assessments[id];
      const reference = new Map(collect(join('course-src', assessment.referenceDir)));
      const files = item.starterFiles.filter(file => /\.(?:m?js|jsx|ts|tsx|json)$/.test(file.path)).map(file => file.path === changedFile ? {path: file.path, content: implementation} : reference.has(file.path) ? {path: file.path, content: reference.get(file.path)} : file);
      const w = await assessmentContext(env);
      const result = await w.DevPathAssessment.run({item, assessment, files, fingerprint: `${id}:any-signature-regression`});
      assert.equal(result.kind, 'type-error', `${id}: ${result.text}`);
      assert.ok(result.diagnostics.some(diagnostic => diagnostic.file === `contracts/${id}.types.ts`), `${id}: diagnostic must come from the protected assertions`);
    }
  } finally { await env.close(); }
});

test('19.04 reproduces the intentional distributive conditional diagnostic before correction', async () => {
  const id = '19.04';
  const item = catalog.find(entry => entry.id === id);
  const assessment = assessments[id];
  const env = setup();
  try {
    const w = await assessmentContext(env);
    const diagnosticAssessment = {...assessment, checks: ['types'], contractTypeFiles: undefined, typeContractMutants: undefined};
    const result = await w.DevPathAssessment.run({item, assessment: diagnosticAssessment, files: item.starterFiles, fingerprint: `${id}:intentional-diagnostic`});
    assert.equal(result.kind, 'type-error', result.text);
    assert.deepEqual(result.diagnostics.map(diagnostic => [diagnostic.code, diagnostic.file, diagnostic.line]), [[2344, 'is-string.ts', 9]]);
  } finally { await env.close(); }
});

test('19.04 type-contract mutation does not count a missing protected export as a semantic kill', async () => {
  const id = '19.04';
  const item = catalog.find(entry => entry.id === id);
  const assessment = {...assessments[id], typeContractMutants: [{id: 'missing-export', files: [{path: 'is-string.ts', content: 'export type IsString<T> = T extends string ? true : false;'}]}]};
  const env = setup();
  try {
    const reference = new Map(collect(join('course-src', assessments[id].referenceDir)).filter(([path]) => /\.(?:m?js|jsx|ts|tsx|json)$/.test(path)));
    const files = item.starterFiles.filter(file => /\.(?:m?js|jsx|ts|tsx|json)$/.test(file.path)).map(file => reference.has(file.path) ? {path: file.path, content: reference.get(file.path)} : file);
    for (const [path, content] of reference) if (!files.some(file => file.path === path)) files.push({path, content});
    const w = await assessmentContext(env);
    const result = await w.DevPathAssessment.run({item, assessment, files, fingerprint: `${id}:missing-export-mutant`});
    assert.equal(result.kind, 'failed', result.text);
    assert.match(result.text, /não pôde ser avaliado|sobreviveu semanticamente/i);
    assert.ok(result.diagnostics.some(diagnostic => [2305, 2307].includes(diagnostic.code)), 'the missing-export diagnostic must be reported, not counted as a semantic kill');
  } finally { await env.close(); }
});

test('19.08 published run requires a meaningful submitted suite and catches a broken emitter', async () => {
  const id = '19.08';
  const item = catalog.find(entry => entry.id === id);
  const assessment = assessments[id];
  const env = setup();
  try {
    const runnable = file => /\.(?:m?js|jsx|ts|tsx|json)$/.test(file.path);
    const reference = new Map(collect(join('course-src', assessment.referenceDir)).filter(([path]) => runnable({path})));
    const referenceFiles = item.starterFiles.filter(runnable).map(file => reference.has(file.path) ? {path: file.path, content: reference.get(file.path)} : file);
    for (const [path, content] of reference) if (!referenceFiles.some(file => file.path === path)) referenceFiles.push({path, content});
    const correct = await execute(env, referenceFiles, id);
    assert.equal(correct.kind, 'result', correct.text);
    assert.equal(correct.tests.failed, 0, correct.text);

    const alwaysPass = `import {test} from 'node:test'; test('always passes',()=>{});`;
    const correctWithWeakSuite = referenceFiles.map(file => file.path === 'emitter.test.ts' ? {...file, content: alwaysPass} : file);
    const weakSuite = await execute(env, correctWithWeakSuite, id);
    assert.ok(weakSuite.kind !== 'result' || weakSuite.tests?.failed > 0, `a same-path always-pass suite must not grade 19.08: ${weakSuite.text}`);

    const correctWithEmptySuite = referenceFiles.map(file => file.path === 'emitter.test.ts' ? {...file, content: ''} : file);
    const emptySuite = await execute(env, correctWithEmptySuite, id);
    assert.notEqual(emptySuite.kind, 'result', 'an empty learner suite must not grade 19.08');

    const badEmitter = assessment.mutantDirs.find(mutant => mutant.id === 'off-does-not-remove').files.find(file => file.path === 'emitter.ts');
    const brokenWithValidSuite = referenceFiles.map(file => file.path === 'emitter.ts' ? badEmitter : file);
    const broken = await execute(env, brokenWithValidSuite, id);
    assert.ok(broken.kind !== 'result' || broken.tests?.failed > 0, `the authored suite must catch off-does-not-remove: ${broken.text}`);

    const missingSuite = referenceFiles.filter(file => file.path !== 'emitter.test.ts');
    const missing = await execute(env, missingSuite, id);
    assert.notEqual(missing.kind, 'result', 'the published reference without its required learner suite must fail clearly');
  } finally { await env.close(); }
});

test('17.03 published behavior tests and typecheck reject a compile-valid empty-result implementation', async () => {
  const id = '17.03';
  const item = catalog.find(entry => entry.id === id);
  const assessment = assessments[id];
  const env = setup();
  try {
    const reference = new Map(collect(join('course-src', assessment.referenceDir)).filter(([path]) => /\.(?:m?js|jsx|ts|tsx|json)$/.test(path)));
    const files = item.starterFiles.filter(file => /\.(?:m?js|jsx|ts|tsx|json)$/.test(file.path)).map(file => reference.has(file.path) ? {path: file.path, content: reference.get(file.path)} : file);
    for (const [path, content] of reference) if (!files.some(file => file.path === path)) files.push({path, content});
    const w = await assessmentContext(env);
    const correct = await w.DevPathAssessment.run({item, assessment, files, fingerprint: `${id}:reference`});
    assert.equal(correct.kind, 'passed', correct.text);
    const mutant = assessment.mutantDirs.find(entry => entry.id === '17.03-behavior').files.find(file => file.path === 'colecoes.ts');
    const checked = await w.DevPathTypeChecker.check({files: files.map(file => file.path === 'colecoes.ts' ? mutant : file), entryPaths: ['colecoes.ts']});
    assert.equal(checked.kind, 'passed', `the semantic mutant must compile: ${checked.text}`);
    const broken = await w.DevPathAssessment.run({item, assessment, files: files.map(file => file.path === 'colecoes.ts' ? mutant : file), fingerprint: `${id}:empty-results`});
    assert.equal(broken.kind, 'failed', broken.text);
    assert.match(broken.text, /não passa seus testes comportamentais/i);
  } finally { await env.close(); }
});

for (const item of catalog.filter(entry => entry.autoTested)) {
  if (item.id === '21.05') {
    test('21.05 native Worker assessment is covered by the browser gate', {
      skip: 'Requires a native browser Worker; scripts/test-phase2-workers.mjs plus QAEdge (owned by fase2_workers) is the required gate. Node worker_threads/jsdom cannot establish browser Worker lifecycle or message identity.',
    }, () => {});
    continue;
  }
  const assessment = assessments[item.id];
  const predictionOrReading = observationalStarterPassKinds.get(item.id) === item.kind
    && assessment.assertionCases?.length > 0;
  const objectiveSpecificStarterPassKind = objectiveSpecificStarterPassKinds.get(item.id);
  const objectiveSpecificStarterPass = objectiveSpecificStarterPassKind === item.kind;
  const renameRegression = item.id === '04.10'
    && /renome|novo nome/i.test(item.objective || '')
    && assessment.checks.includes('rubric');
  const title = predictionOrReading || renameRegression || objectiveSpecificStarterPass
    ? `${item.id}: objective-specific starter acceptance and reference solution pass`
    : `${item.id}: starter fails and reference solution passes`;
  test(title, async () => {
    assert.ok(assessment?.referenceDir, `${item.id}: missing referenceDir`);
    const solutionDir = join('course-src', assessment.referenceDir);
    assert.ok(existsSync(solutionDir), `missing reference solution ${solutionDir}`);
    const env = setup();
    try {
      const runnable = file => /\.(?:m?js|jsx|ts|tsx|json)$/.test(file.path) || (['dom', 'network'].includes(assessment.environment) && /\.(?:html?|css)$/.test(file.path));
      const starter = await execute(env, item.starterFiles.filter(runnable), item.id);
      if (predictionOrReading || renameRegression || objectiveSpecificStarterPass) {
        assert.equal(starter.kind, 'result', `${item.id}: the reference observation for this ${item.kind} activity must execute (${starter.text})`);
        assert.equal(starter.tests?.failed, 0, `${item.id}: intentional reference observation should pass (${starter.text})`);
      } else {
        assert.ok(starter.kind !== 'result' || (starter.tests && starter.tests.failed > 0), `${item.id}: implementation starter unexpectedly passed its tests`);
      }
      const referenceFiles = new Map(collect(solutionDir).filter(([path]) => /\.(?:m?js|jsx|ts|tsx|json|html?|css)$/.test(path)));
      const files = item.starterFiles.filter(runnable).map(file => referenceFiles.has(file.path) ? {path: file.path, content: referenceFiles.get(file.path)} : file);
      for (const [path, content] of referenceFiles) if (!files.some(file => file.path === path)) files.push({path, content});
      const solved = await execute(env, files, item.id);
      assert.equal(solved.kind, 'result', `${solved.text}\n${JSON.stringify(solved.diagnostics || [])}`);
      // Non-trivial: at least one executed test and at least two expect() assertions in the published suite (a one-assertion suite is accepted only with >= 2 assertions).
      const suiteText = tests[item.id] || assessment.tests || '';
      const assertionCount = (suiteText.match(/expect\(|assert\.|assert\(|@ts-expect-error|Assert</g) || []).length;
      const hasPublishedCases = (assessment.assertionCases || []).length > 0;
      assert.ok(solved.tests.total >= 1 && (assertionCount >= 2 || solved.tests.total >= 2 || hasPublishedCases), `${item.id}: no executed behavioral checks tied to a published case (${solved.tests.total} tests, ${assertionCount} assertions)`);
      assert.equal(solved.tests.failed, 0, solved.text);
      if (objectiveSpecificStarterPass) {
        for (const mutant of assessment.mutantDirs || []) {
          const mutantFiles = new Map((mutant.files || []).map(file => [file.path, file.content]));
          const incorrect = files.map(file => mutantFiles.has(file.path) ? {...file, content: mutantFiles.get(file.path)} : file);
          for (const [path, content] of mutantFiles) if (!incorrect.some(file => file.path === path)) incorrect.push({path, content});
          const rejected = await execute(env, incorrect, item.id);
          assert.ok(['failed', 'result'].includes(rejected.kind), `${item.id}/${mutant.id}: expected semantic execution, got ${rejected.kind}: ${rejected.text}`);
          assert.ok(rejected.tests?.failed > 0, `${item.id}/${mutant.id}: authored behavioral cases must reject this incorrect behavior (${rejected.text})`);
        }
      }
      if (item.id === '11.07') {
        const brokenMarkup = item.starterFiles.filter(runnable).map(file => file.path === 'main.js' ? referenceFiles.get('main.js') : file);
        const markupOnly = await execute(env, brokenMarkup, item.id);
        assert.ok(markupOnly.kind !== 'result' || markupOnly.tests?.failed > 0, '11.07 must reject the broken starter HTML even when main.js is correct');
      }
      if (item.id === '11.08') {
        const index = files.find(file => file.path === 'index.html');
        assert.ok(index, '11.08 must evaluate the submitted index.html');
        const regressions = [
          ['missing kanban column', index.content.replace(/<section aria-labelledby="done-title">[\s\S]*?<\/section>/, '')],
          ['missing form and live region', index.content.replace(/<form[\s\S]*?<\/form>/, '').replace(' aria-live="polite"', '')],
          ['missing accessible label', index.content.replace('<label for="texto">Nova tarefa</label>', '')],
        ];
        for (const [label, html] of regressions) {
          const attempt = files.map(file => file.path === 'index.html' ? {...file, content: html} : file);
          const result = await execute(env, attempt, item.id);
          assert.ok(result.kind !== 'result' || result.tests?.failed > 0, `11.08 must reject submitted HTML with ${label}`);
        }
      }
    } finally { await env.close(); }
  });
}
after(() => esbuild.stop());
