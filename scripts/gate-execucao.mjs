// Gate de execucao (2.5.1, modo aviso): sobre os artefatos PUBLICADOS.
// Para cada atividade executavel em Node/jsdom/worker:
//   - o starter deve FALHAR;
//   - a solucao de referencia (correctFiles publicado) deve PASSAR;
//   - cada mutante deve FALHAR (timeout por teste: mutante que trava conta como morto por timeout).
// Usa o mesmo avaliador do navegador (public/course-assessment.js) dentro do harness jsdom.
//
// Uso: node scripts/gate-execucao.mjs [--strict] [--json] [--only=ID,ID] [--jobs=3] [--timeout=3000]
//   --strict  sai com 1 se houver qualquer falha (padrao: sai com 0, modo aviso)
//   --json    imprime o relatorio completo em JSON
const ROOT = new URL('..', import.meta.url);
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import vm from 'node:vm';
import path from 'node:path';
import * as esbuild from 'esbuild-wasm';
import {parse} from 'acorn';
import {checkTypes} from './typecheck-host.mjs';
import {setup} from './course-runner-harness.mjs';

const SELF = fileURLToPath(import.meta.url);
process.chdir(fileURLToPath(ROOT));
const MARKER = '__GATE_EXECUCAO_JSON__';
const EXECUTABLE_ENVIRONMENTS = new Set(['javascript', 'node-simulated']);
// Kinds that mean "the implementation did not pass the suite" (the gate's pass condition for starters and mutants).
const FAILING_KINDS = new Set(['failed', 'timeout', 'error', 'type-error']);

const isFileOk = file => file && typeof file.path === 'string' && typeof file.content === 'string';

function walkSolution(dir, prefix = '') {
  return readdirSync(dir, {withFileTypes: true}).flatMap(entry => entry.isDirectory()
    ? walkSolution(path.join(dir, entry.name), `${prefix}${entry.name}/`)
    : entry.name.endsWith('.md') ? [] : [{path: `${prefix}${entry.name}`, content: readFileSync(path.join(dir, entry.name), 'utf8')}]);
}

// Reference: the published correctFiles. When an activity publishes none, the solution is read from course-src
// and labelled, so the report shows which references the published artifacts cannot reproduce on their own.
export function referenceFor(id, assessment) {
  if (Array.isArray(assessment.correctFiles) && assessment.correctFiles.length) return {source: 'published', files: assessment.correctFiles};
  const dir = path.join('course-src', assessment.referenceDir || `solutions/${id}`);
  if (!existsSync(dir)) return {source: 'none', files: []};
  return {source: 'course-src (not published)', files: walkSolution(dir)};
}

export function eligibility(assessment, item) {
  if (!item) return 'no catalog item';
  if (!assessment) return 'no assessment';
  if (assessment.environment === 'typescript') return 'typescript-only';
  if (assessment.checks?.includes('types')) return 'typed (TypeScript checker, not gated here)';
  if (assessment.environment === 'local') return 'local evidence';
  if (assessment.environment === 'rubric') return 'rubric';
  if (assessment.environment === 'network') return 'network (not runnable in Node)';
  if (assessment.environment === 'dom') return 'dom (evaluator requires a browser document)';
  if (!EXECUTABLE_ENVIRONMENTS.has(assessment.environment)) return `environment ${assessment.environment}`;
  if (!assessment.checks?.includes('behavior') && !assessment.checks?.includes('mutation')) return 'no behavior/mutation check';
  return null;
}

function overlay(base, extra) {
  const map = new Map(base.map(file => [file.path, file]));
  for (const file of extra) map.set(file.path, file);
  return [...map.values()];
}

function suiteFilesOf(assessment, item) {
  const declared = Array.isArray(assessment.testPaths) ? assessment.testPaths : [assessment.testPath].filter(Boolean);
  return (item.starterFiles || []).filter(file => declared.includes(file.path) || /(?:^|\/)tests?\//i.test(file.path) || /\.(?:test|spec)\.[cm]?[jt]sx?$/i.test(file.path));
}

function mutantsFor(assessment, override) {
  const list = override ?? (assessment.mutantDirs || []);
  return list.map((mutant, index) => ({
    id: mutant?.id ?? `mutant-${index + 1}`,
    files: Array.isArray(mutant) ? mutant : (mutant?.files || []),
  }));
}

// Loads the published artifacts and the evaluator once per process (jsdom + esbuild-wasm + TypeScript libs).
export async function createContext() {
  const catalog = new Map(JSON.parse(readFileSync('public/course-catalog.json', 'utf8')).map(item => [item.id, item]));
  const assessments = JSON.parse(readFileSync('public/course-assessments.json', 'utf8'));
  const courseTests = JSON.parse(readFileSync('public/course-tests.json', 'utf8'));
  const moduleGraph = (() => {
    const w = {TextEncoder};
    w.window = w;
    vm.runInThisContext('(function(window){' + readFileSync('public/module-graph.js', 'utf8') + '})')(w);
    return w.DevPathModuleGraph;
  })();
  const typescriptLibraries = {};
  for (const name of readdirSync('node_modules/typescript/lib').filter(name => /^lib\..+\.d\.ts$/.test(name))) {
    const content = readFileSync(`node_modules/typescript/lib/${name}`, 'utf8');
    typescriptLibraries[`/node_modules/typescript/lib/${name}`] = content;
    typescriptLibraries[`/${name}`] = content;
  }
  const env = setup();
  try {
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
    vm.runInNewContext(readFileSync('public/course-assessment.js', 'utf8'), w);
    return {
      catalog, assessments, courseTests,
      evaluate: (input) => w.DevPathAssessment.run(input),
      close: () => env.close(),
    };
  } catch (error) {
    await env.close();
    throw error;
  }
}

const timed = async fn => {
  const started = Date.now();
  try {
    const result = await fn();
    return {kind: result.kind, text: String(result.text || '').split('\n')[0].slice(0, 200), ms: Date.now() - started};
  } catch (error) {
    return {kind: 'error', text: String(error?.message || error).slice(0, 200), ms: Date.now() - started};
  }
};

// Evaluates one activity. opts (used by tests to forge cases): timeoutMs, starterFiles, reference, mutants.
export async function evaluateActivity(ctx, id, opts = {}) {
  const assessment0 = ctx.assessments[id];
  const item = ctx.catalog.get(id);
  const reason = eligibility(assessment0, item);
  if (reason) return {id, status: 'skipped', reason};
  const reference0 = opts.reference ?? referenceFor(id, assessment0);
  if (!reference0.files.length) return {id, status: 'skipped', reason: 'no reference solution'};
  // Student-suite activities (runStudentSuite) grade the reference with the submission only where paths are missing, so they are
  // re-expressed as plain behavior activities: the declared suite file (published in starterFiles) becomes the inline suite and
  // the reference files travel with it. Starter, reference and mutants then go through the same behavior path.
  const suite = assessment0.studentSuite === true ? suiteFilesOf(assessment0, item) : [];
  if (assessment0.studentSuite === true && suite.length !== 1) return {id, status: 'skipped', reason: 'student suite without a single test file'};
  const reference = suite.length ? {...reference0, files: overlay(suite, reference0.files)} : reference0;
  const view = suite.length ? {...assessment0, studentSuite: false, studentSuiteKind: undefined, testPath: path.posix.join(path.posix.dirname(suite[0].path), '__devpath_gate_suite__.js'), testPaths: undefined, tests: suite[0].content, behaviorTestPath: undefined} : assessment0;
  const timeoutMs = Math.max(opts.timeoutMs ?? 3000, assessment0.timeoutMs || 0);
  const assessment = {
    ...view,
    tests: view.tests ?? ctx.courseTests[id],
    // Mutants are run one by one below, so the suite run itself must take the plain behavior path (not runStudentSuite).
    checks: [...new Set([...(view.checks || []).filter(check => check !== 'mutation'), 'behavior'])],
    correctFiles: reference.files,
    mutantDirs: [],
    timeoutMs,
  };
  const run = (files, label) => timed(() => ctx.evaluate({item, assessment, files, fingerprint: `gate-${id}-${label}`}));
  const starterFiles = opts.starterFiles ?? item.starterFiles;
  const starter = await run(starterFiles, 'starter');
  const referenceResult = await run(reference.files, 'reference');
  if (starter.kind === 'unsupported' || referenceResult.kind === 'unsupported') {
    return {id, status: 'skipped', reason: `runner unsupported: ${(starter.kind === 'unsupported' ? starter : referenceResult).text || 'no text'}`};
  }
  const mutants = [];
  for (const mutant of mutantsFor(assessment0, opts.mutants)) {
    if (referenceResult.kind !== 'passed') {
      mutants.push({id: mutant.id, kind: 'not-run', killed: false, killedByTimeout: false, ms: 0});
      continue;
    }
    const result = await run(overlay(reference.files, mutant.files), `mutant-${mutant.id}`);
    mutants.push({id: mutant.id, kind: result.kind, killed: FAILING_KINDS.has(result.kind), killedByTimeout: result.kind === 'timeout', ms: result.ms});
  }
  const problems = [];
  if (starter.kind === 'passed') problems.push('starter-not-failing');
  if (referenceResult.kind !== 'passed') problems.push(`reference-failing (${referenceResult.kind})`);
  for (const mutant of mutants) if (mutant.kind !== 'not-run' && !mutant.killed) problems.push(`mutant-surviving ${mutant.id} (${mutant.kind})`);
  return {
    id,
    title: item.title,
    environment: assessment0.environment,
    status: problems.length ? 'fail' : 'ok',
    problems,
    referenceSource: reference.source,
    starter,
    reference: referenceResult,
    mutants,
    mutantCount: mutants.length,
  };
}

function parseArgs(argv) {
  const flags = {strict: false, json: false, only: null, jobs: 3, timeout: 3000, child: false, ids: []};
  for (const arg of argv) {
    if (arg === '--strict') flags.strict = true;
    else if (arg === '--json') flags.json = true;
    else if (arg === '--child') flags.child = true;
    else if (arg.startsWith('--only=')) flags.only = arg.slice(7).split(',').map(value => value.trim()).filter(Boolean);
    else if (arg.startsWith('--ids=')) flags.ids = arg.slice(6).split(',').filter(Boolean);
    else if (arg.startsWith('--jobs=')) flags.jobs = Math.max(1, Number(arg.slice(7)) || 3);
    else if (arg.startsWith('--timeout=')) flags.timeout = Number(arg.slice(10)) || 3000;
    else throw new Error(`Argumento desconhecido: ${arg}`);
  }
  return flags;
}

function runChild(ids, timeout) {
  return new Promise((resolve, reject) => {
    execFile(process.execPath, [SELF, '--child', `--ids=${ids.join(',')}`, `--timeout=${timeout}`],
      {maxBuffer: 64 * 1024 * 1024, timeout: 30 * 60 * 1000, cwd: fileURLToPath(ROOT)},
      (error, stdout, stderr) => {
        const line = stdout.split('\n').find(text => text.startsWith(MARKER));
        if (!line) return reject(new Error(`child sem resultado: ${error?.message || stderr.slice(0, 300)}`));
        resolve(JSON.parse(line.slice(MARKER.length)));
      });
  });
}

async function childMain(flags) {
  const ctx = await createContext();
  const results = [];
  try {
    for (const id of flags.ids) {
      try {
        results.push(await evaluateActivity(ctx, id, {timeoutMs: flags.timeout}));
      } catch (error) {
        results.push({id, status: 'fail', problems: [`harness error: ${error?.message || error}`]});
      }
    }
  } finally {
    await ctx.close();
  }
  console.log(MARKER + JSON.stringify(results));
}

function totalsOf(results, runtimeMs) {
  const executed = results.filter(result => result.status !== 'skipped');
  const skipReasons = {};
  for (const result of results.filter(result => result.status === 'skipped')) skipReasons[result.reason] = (skipReasons[result.reason] || 0) + 1;
  const mutants = executed.flatMap(result => result.mutants || []);
  const ran = mutants.filter(mutant => mutant.kind !== 'not-run');
  const has = problem => executed.filter(result => result.problems.some(text => text.startsWith(problem))).length;
  return {
    listed: results.length,
    executed: executed.length,
    skipped: results.length - executed.length,
    skipReasons,
    starterNotFailing: has('starter-not-failing'),
    referenceFailing: has('reference-failing'),
    activitiesWithSurvivingMutant: has('mutant-surviving'),
    mutantsRun: ran.length,
    mutantsKilled: ran.filter(mutant => mutant.killed).length,
    mutantsKilledByTimeout: ran.filter(mutant => mutant.killedByTimeout).length,
    mutantsSurviving: ran.filter(mutant => !mutant.killed).length,
    executedWithoutMutant: executed.filter(result => !result.mutantCount).length,
    referenceFromCourseSrc: executed.filter(result => result.referenceSource !== 'published').length,
    failingIds: executed.filter(result => result.status === 'fail').map(result => result.id),
    runtimeMs,
  };
}

async function mainParent(flags) {
  const started = Date.now();
  const ctxAssessments = JSON.parse(readFileSync('public/course-assessments.json', 'utf8'));
  const catalog = new Map(JSON.parse(readFileSync('public/course-catalog.json', 'utf8')).map(item => [item.id, item]));
  let ids = Object.keys(ctxAssessments).sort();
  if (flags.only) {
    const unknown = flags.only.filter(id => !ctxAssessments[id]);
    if (unknown.length) throw new Error(`IDs desconhecidos em --only: ${unknown.join(', ')}`);
    ids = ids.filter(id => flags.only.includes(id));
  }
  const results = [];
  const executable = [];
  for (const id of ids) {
    const reason = eligibility(ctxAssessments[id], catalog.get(id));
    if (reason) results.push({id, status: 'skipped', reason});
    else executable.push(id);
  }
  const jobs = Math.max(1, Math.min(flags.jobs, executable.length));
  const chunks = Array.from({length: jobs}, (_, index) => executable.filter((_, i) => i % jobs === index));
  const settled = await Promise.all(chunks.map(chunk => chunk.length
    ? runChild(chunk, flags.timeout).catch(error => chunk.map(id => ({id, status: 'fail', problems: [error.message]})))
    : []));
  results.push(...settled.flat());
  results.sort((a, b) => a.id.localeCompare(b.id));
  const runtimeMs = Date.now() - started;
  const totals = totalsOf(results, runtimeMs);

  if (flags.json) {
    console.log(JSON.stringify({totals, results}, null, 2));
  } else {
    for (const result of results) {
      if (result.status === 'skipped') console.log(`${result.id.padEnd(6)} skipped   ${result.reason}`);
      else {
        const mutantText = result.mutants.length ? `${result.mutants.filter(mutant => mutant.killed).length}/${result.mutants.length} killed` : 'no mutant';
        console.log(`${result.id.padEnd(6)} ${result.status.padEnd(9)} starter=${result.starter?.kind} reference=${result.reference?.kind} mutants=${mutantText} [${result.referenceSource}]${result.problems.length ? ` :: ${result.problems.join('; ')}` : ''}`);
      }
    }
    console.log('');
    console.log(`Totals: listed ${totals.listed}; executed ${totals.executed}; skipped ${totals.skipped} ${JSON.stringify(totals.skipReasons)}`);
    console.log(`starter-not-failing ${totals.starterNotFailing}; reference-failing ${totals.referenceFailing}; activities with surviving mutant ${totals.activitiesWithSurvivingMutant}`);
    console.log(`mutants run ${totals.mutantsRun}; killed ${totals.mutantsKilled} (by timeout ${totals.mutantsKilledByTimeout}); surviving ${totals.mutantsSurviving}`);
    console.log(`executed without mutant ${totals.executedWithoutMutant}; reference not published (from course-src) ${totals.referenceFromCourseSrc}`);
    console.log(`failing ids (${totals.failingIds.length}): ${totals.failingIds.join(' ') || 'none'}`);
    console.log(`runtime ${(totals.runtimeMs / 1000).toFixed(1)} s with ${jobs} process(es)`);
    console.log(flags.strict ? 'mode: strict' : 'mode: warning (exit 0; use --strict to fail)');
  }
  if (flags.strict && totals.failingIds.length) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === SELF) {
  const flags = parseArgs(process.argv.slice(2));
  if (flags.child) await childMain(flags);
  else await mainParent(flags);
}
