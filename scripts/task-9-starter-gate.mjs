// Node-side replay of the browser gate for Task 9 starters (23.03, 23.09, 23.10, 23.11).
// Uses the same site assessment code (public/course-assessment.js) inside the jsdom harness.
// Usage: node scripts/task-9-starter-gate.mjs [id ...]
import {readFileSync, readdirSync} from 'node:fs';
import vm from 'node:vm';
import * as esbuild from 'esbuild-wasm';
import {parse} from 'acorn';
import {checkTypes} from './typecheck-host.mjs';
import {setup} from './course-runner-harness.mjs';

const catalog = JSON.parse(readFileSync('public/course-catalog.json', 'utf8'));
const assessments = JSON.parse(readFileSync('public/course-assessments.json', 'utf8'));
const moduleGraph = (() => { const w = {TextEncoder}; w.window = w; vm.runInThisContext('(function(window){' + readFileSync('public/module-graph.js', 'utf8') + '})')(w); return w.DevPathModuleGraph; })();
const assessmentSource = readFileSync('public/course-assessment.js', 'utf8');
const typescriptLibraries = {};
for (const name of readdirSync('node_modules/typescript/lib').filter(name => /^lib\..+\.d\.ts$/.test(name))) {
  const content = readFileSync(`node_modules/typescript/lib/${name}`, 'utf8');
  typescriptLibraries[`/node_modules/typescript/lib/${name}`] = content;
  typescriptLibraries[`/${name}`] = content;
}

function solutionFiles(referenceDir) {
  const base = `course-src/${referenceDir}`;
  const walk = (dir, prefix = '') => readdirSync(dir, {withFileTypes: true}).flatMap(entry => entry.isDirectory()
    ? walk(`${dir}/${entry.name}`, `${prefix}${entry.name}/`)
    : entry.name.endsWith('.md') ? [] : [{path: `${prefix}${entry.name}`, content: readFileSync(`${dir}/${entry.name}`, 'utf8')}]);
  return walk(base);
}

async function assessmentContext(env) {
  env.w.eval(readFileSync('public/course-node-runtime.js', 'utf8'));
  const w = {TextEncoder, DevPathNodeRuntime: env.w.DevPathNodeRuntime, DevPathModuleGraph: {buildModuleGraph: input => moduleGraph.buildModuleGraph(input, {build: esbuild.build, parse, transform: esbuild.transform, runtime: input.runtime})}};
  w.window = w;
  w.DevPathTypeChecker = {async check(input) {
    const result = checkTypes(input, {libraries: typescriptLibraries});
    const errors = result.diagnostics.filter(diagnostic => diagnostic.category === 'error');
    const kind = !result.supported ? 'unsupported' : errors.length ? 'type-error' : 'passed';
    return {...result, kind, source: 'browser'};
  }};
  w.DevPathCourseRunner = {run(code, finish, options) { return env.w.DevPathCourseRunner.run(code, (kind, text, tests, node) => finish(kind, text, tests, node), options); }};
  vm.runInNewContext(assessmentSource, w);
  return w;
}

const ids = process.argv.slice(2).length ? process.argv.slice(2) : ['23.03', '23.09', '23.10', '23.11'];
const env = setup();
const summary = {};
try {
  const w = await assessmentContext(env);
  for (const id of ids) {
    const item = catalog.find(entry => entry.id === id);
    const assessment = assessments[id];
    // Same reference set as the browser gate: every non-Markdown file of course-src/solutions/<id>.
    const reference = solutionFiles(assessment.referenceDir || `solutions/${id}`);
    const out = {};
    out.reference = await w.DevPathAssessment.run({item, assessment, files: reference, fingerprint: `task9-ref-${id}`});
    out.starter = await w.DevPathAssessment.run({item, assessment, files: item.starterFiles, fingerprint: `task9-starter-${id}`});
    if (assessment.behaviorTestPath && assessment.studentSuite !== true && assessment.mutantDirs?.[0]?.files) {
      const broken = new Map(reference.map(file => [file.path, file]));
      for (const file of assessment.mutantDirs[0].files) broken.set(file.path, file);
      // Mutant check only: the mutant replaces lib files and the run uses the suite EMBEDDED in the assessment (tests/*), so
      // the behaviorTestPath file below is NOT what the runner executes. The 'always passes' placeholder is therefore inert
      // and is kept only as a no-op control; the verdict comes from the embedded suite failing on the mutant.
      broken.set(assessment.behaviorTestPath, {path: assessment.behaviorTestPath, content: 'test("always passes",()=>{});'});
      out.mutantAgainstEmbeddedSuite = await w.DevPathAssessment.run({item, assessment, files: [...broken.values()], fingerprint: `task9-broken-${id}`});
    }
    summary[id] = Object.fromEntries(Object.entries(out).map(([name, result]) => [name, {kind: result.kind, text: String(result.text || '').split('\n').slice(0, 4).join(' | ').slice(0, 300), tests: result.tests ? {passed: result.tests.passed, failed: result.tests.failed, total: result.tests.total} : undefined}]));
  }
} finally { env.close(); }
console.log(JSON.stringify(summary, null, 2));
const gateFailures = [];
for (const id of ids) {
  if (summary[id].reference.kind !== 'passed') gateFailures.push(`${id} reference ${summary[id].reference.kind}`);
  if (summary[id].starter.kind !== 'failed' && summary[id].starter.kind !== 'type-error') gateFailures.push(`${id} starter ${summary[id].starter.kind}`);
  if (summary[id].mutantAgainstEmbeddedSuite && summary[id].mutantAgainstEmbeddedSuite.kind === 'passed') gateFailures.push(`${id} protected mutant passed`);
}
console.log(gateFailures.length ? `GATE FAIL: ${gateFailures.join('; ')}` : 'GATE PASS (reference passed, starter semantic non-pass)');
