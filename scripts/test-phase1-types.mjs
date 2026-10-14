import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join, resolve} from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import * as esbuild from 'esbuild-wasm';
import {parse} from 'acorn';
import {checkTypes} from './typecheck-host.mjs';
import {setup} from './course-runner-harness.mjs';

const catalog = JSON.parse(readFileSync('public/course-catalog.json', 'utf8'));
const assessments = JSON.parse(readFileSync('public/course-assessments.json', 'utf8'));
const courseTests = JSON.parse(readFileSync('public/course-tests.json', 'utf8'));
const moduleGraph = (() => {
  const w = {TextEncoder};
  w.window = w;
  vm.runInThisContext('(function(window){' + readFileSync('public/module-graph.js', 'utf8') + '})')(w);
  return w.DevPathModuleGraph;
})();
const tsLibraries = {};
function addDeclarations(directory, prefix) {
  for (const name of readdirSync(directory)) {
    const local = join(directory, name);
    if (statSync(local).isDirectory()) addDeclarations(local, `${prefix}/${name}`);
    else if (name.endsWith('.d.ts') || name === 'package.json') tsLibraries[`${prefix}/${name}`] = readFileSync(local, 'utf8');
  }
}
for (const name of readdirSync('node_modules/typescript/lib').filter(name => /^lib\..+\.d\.ts$/.test(name))) {
  const contents = readFileSync(join('node_modules/typescript/lib', name), 'utf8');
  tsLibraries[`/node_modules/typescript/lib/${name}`] = contents;
  tsLibraries[`/${name}`] = contents;
}
addDeclarations(resolve('node_modules/@types/node'), '/node_modules/@types/node');
addDeclarations(resolve('node_modules/undici-types'), '/node_modules/undici-types');

async function makeAssessmentContext(env) {
  env.w.eval(readFileSync('public/course-node-runtime.js', 'utf8'));
  const w = {
    TextEncoder,
    DevPathNodeRuntime: env.w.DevPathNodeRuntime,
    DevPathModuleGraph: {buildModuleGraph: input => moduleGraph.buildModuleGraph(input, {
      build: esbuild.build,
      parse,
      transform: esbuild.transform,
      runtime: input.runtime,
    })},
  };
  w.window = w;
  w.DevPathTypeChecker = {async check(input) {
    const result = checkTypes(input, {libraries: tsLibraries});
    const errors = result.diagnostics.filter(diagnostic => diagnostic.category === 'error');
    return {...result, kind: !result.supported ? 'unsupported' : errors.length ? 'type-error' : 'passed', source: 'browser'};
  }};
  w.DevPathCourseRunner = {run(code, finish, options) {
    return env.w.DevPathCourseRunner.run(code, (kind, text, tests, node) => finish(kind, text, tests, node), options);
  }};
  vm.runInNewContext(readFileSync('public/course-assessment.js', 'utf8'), w);
  return w;
}

function collect(directory, prefix = '') {
  return readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const full = join(directory, entry.name);
    return entry.isDirectory()
      ? collect(full, relative)
      : /\.(?:m?js|jsx|ts|tsx|json)$/i.test(relative) ? [[relative, readFileSync(full, 'utf8')]] : [];
  });
}

async function runPublished(id, files, assessmentOverride) {
  const env = setup();
  try {
    const assessment = assessmentOverride || assessments[id];
    const w = await makeAssessmentContext(env);
    return await w.DevPathAssessment.run({item: catalog.find(item => item.id === id), assessment, files, fingerprint: `${id}:phase1-types`});
  } finally {
    env.close();
  }
}

test('17.11 and 22.11 are published in the requested positions with executable contracts', () => {
  const ids = catalog.map(item => item.id);
  for (const [newId, beforeId] of [['17.11', '17.08'], ['22.11', '22.05']]) {
    assert.equal(ids.filter(id => id === newId).length, 1, `${newId} exists exactly once`);
    assert.equal(ids.indexOf(newId), ids.indexOf(beforeId) - 1, `${newId} is immediately before ${beforeId}`);
    assert.ok(assessments[newId]?.checks.includes('behavior'), `${newId} protects runtime behavior`);
    assert.ok(assessments[newId]?.checks.includes('types'), `${newId} checks types`);
    assert.ok(courseTests[newId]?.trim(), `${newId} publishes a nonempty behavior suite`);
  }
});

test('17.11 starter fails and reference passes the published evaluator', async () => {
  const item = catalog.find(entry => entry.id === '17.11');
  assert.ok(item, '17.11 is in the catalog');
  const starter = await runPublished('17.11', item.starterFiles);
  assert.notEqual(starter.kind, 'passed', starter.text);
  const reference = await runPublished('17.11', collect(join('course-src', assessments['17.11'].referenceDir)).map(([path, content]) => ({path, content})));
  assert.equal(reference.kind, 'passed', reference.text);
});

test('22.11 starter fails and reference passes the published evaluator', async () => {
  const item = catalog.find(entry => entry.id === '22.11');
  assert.ok(item, '22.11 is in the catalog');
  const starter = await runPublished('22.11', item.starterFiles);
  assert.notEqual(starter.kind, 'passed', starter.text);
  const reference = await runPublished('22.11', collect(join('course-src', assessments['22.11'].referenceDir)).map(([path, content]) => ({path, content})));
  assert.equal(reference.kind, 'passed', reference.text);
});

test('22.11 public contracts reject weakened JSDoc types and any', async () => {
  const assessment = assessments['22.11'];
  assert.ok(assessment.contractTypeFiles?.length, 'protected TypeScript consumer contract exists');
  assert.ok(assessment.typeContractMutants?.length, 'semantic type mutants exist');
  const files = collect(join('course-src', assessment.referenceDir)).map(([path, content]) => ({path, content}));
  for (const mutant of assessment.typeContractMutants) {
    const changed = new Map(files.map(file => [file.path, file]));
    for (const file of mutant.files) changed.set(file.path, file);
    const result = await runPublished('22.11', [...changed.values()]);
    assert.notEqual(result.kind, 'passed', `${mutant.id}: ${result.text}`);
  }
  const withoutDirective = files.map(file => file.path === assessment.entryPath
    ? {...file, content: file.content.replace(/^\/\/ @ts-check\r?\n/, '')}
    : file);
  const directiveResult = await runPublished('22.11', withoutDirective);
  assert.equal(directiveResult.kind, 'passed', `checkJs:true keeps checking annotated JavaScript without the local directive: ${directiveResult.text}`);
  const allAny = files.map(file => file.path === assessment.entryPath
    ? {...file, content: file.content.replace(/\/\*\*[\s\S]*?\*\//g, '')}
    : file);
  const result = await runPublished('22.11', allAny);
  assert.notEqual(result.kind, 'passed', `checkJs plus protected contracts reject removed annotations: ${result.text}`);
});

test('17.11 checks erasable class syntax and preserves its protected type contracts', async () => {
  const assessment = assessments['17.11'];
  assert.equal(assessment.tsconfigPath, 'tsconfig.json');
  assert.ok(assessment.contractTypeFiles?.length, 'protected class consumer contract exists');
  assert.ok(assessment.typeContractMutants?.length, 'semantic class type mutants exist');
  const files = collect(join('course-src', assessment.referenceDir)).map(([path, content]) => ({path, content}));
  const config = files.find(file => file.path === assessment.tsconfigPath);
  assert.match(config.content, /"erasableSyntaxOnly"\s*:\s*true/);
  assert.match(files.find(file => file.path === assessment.entryPath).content, /\bprivate\b/);
  assert.match(files.find(file => file.path === assessment.entryPath).content, /\breadonly\b/);
  assert.match(files.find(file => file.path === assessment.entryPath).content, /\bimplements\b/);
  assert.doesNotMatch(files.find(file => file.path === assessment.entryPath).content, /constructor\s*\(\s*(?:private|protected|public|readonly)\b/);
  for (const mutant of assessment.typeContractMutants) {
    const changed = new Map(files.map(file => [file.path, file]));
    for (const file of mutant.files) changed.set(file.path, file);
    const result = await runPublished('17.11', [...changed.values()]);
    assert.notEqual(result.kind, 'passed', `${mutant.id}: ${result.text}`);
  }
});
