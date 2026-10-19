// Orquestrador da regeneração canônica das etapas 15 e 20–23 (e 23.12, por rubrica).
// Só roda em cópia temporária: recusa execução fora de os.tmpdir() para não sobrescrever o checkout.
// Duas passagens completas na mesma cópia; a segunda deve reproduzir a primeira byte a byte.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync, readdirSync, writeFileSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {isStrictDescendant} from './temporary-path-guard.mjs';

const root = process.cwd();
const scratch = path.resolve(tmpdir());
if (!isStrictDescendant(root, scratch)) {
  console.error(`Recusado: execute em uma cópia temporária dentro de ${scratch}, não no checkout (${root}).`);
  process.exit(3);
}

const GENERATORS = [
  'scripts/task-8b-stage15.mjs',
  'scripts/task-9-stage20.mjs',
  'scripts/task-9-stage21.mjs',
  'scripts/task-9-dom-21-09.mjs',
  'scripts/task-9-stage22.mjs',
  'scripts/task-9-stage23.mjs',
  'scripts/task-9-remaining-assessments.mjs',
  'scripts/task-9-stage23-12.mjs',
  'scripts/task-9-readmes.mjs',
  'scripts/task-9-canonical-texts.mjs',
  'scripts/task-9-advanced-repairs.mjs',
];
const steps = [...GENERATORS, 'course-src/build-public-curriculum.mjs'];

function runStep(step) {
  const r = spawnSync(process.execPath, [step], {cwd: root, encoding: 'utf8', timeout: 300000, windowsHide: true});
  return {command: `node ${step}`, exitCode: r.status, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error?.message || null};
}

function runCycle() {
  const outputs = [];
  for (const step of steps) {
    const result = runStep(step);
    outputs.push(result);
    if (result.exitCode !== 0 || result.error) throw new Error(`${result.command} failed\n${result.stdout}\n${result.stderr}\n${result.error || ''}`);
  }
  return outputs;
}

function walk(dir) {
  return readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    if (entry.name === 'node_modules' || entry.name === '.git') return [];
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [path.relative(root, file).split(path.sep).join('/')];
  });
}

function snapshot() {
  const files = [
    'course-src/assessments.json', 'public/course-assessments.json', 'public/course-catalog.json',
    ...GENERATORS, ...['course-src/solutions', 'course-src/mutants', 'course-src/tests', 'course-src/starters', 'course-src/variants'].flatMap(p => walk(path.join(root, p))),
  ];
  const unique = [...new Set(files)].sort();
  return Object.fromEntries(unique.map(file => [file, createHash('sha256').update(readFileSync(path.join(root, file))).digest('hex')]));
}

const first = runCycle();
const firstSnapshot = snapshot();
const second = runCycle();
const secondSnapshot = snapshot();
assert.deepEqual(secondSnapshot, firstSnapshot, 'canonical generation changed its outputs across identical runs');

const compiled = JSON.parse(readFileSync('course-src/.generated/resolved_preview.json', 'utf8'));
const source = JSON.parse(readFileSync('course-src/assessments.json', 'utf8'));
const published = JSON.parse(readFileSync('public/course-assessments.json', 'utf8'));
const ids = compiled.filter(item => /^(20|21|22|23)\.\d{2}$/.test(item.id)).map(item => item.id);
const assessedIds = Object.keys(source).filter(id => /^(20|21|22|23)\.\d{2}$/.test(id)).sort();
assert.deepEqual(assessedIds, [...ids].sort(), 'Stage 20–23 assessment IDs must match compiled activity identities');
// Canonical items outside the task-9 chain (learner-declared, no transfer block, no protected gate, short README).
const outsideChain = new Set(['20.11', '21.12', '21.13', '21.14']);
for (const id of ids) {
  const a = source[id];
  assert.ok(published[id], `${id} missing from published assessment asset`);
  if (a.environment === 'rubric' && !a.referenceDir) {
    // 23.12: rubric-only item, no reference directory and no transfer by design.
    assert.ok(a.rubric?.length >= 2, `${id} rubric missing`);
    continue;
  }
  assert.ok(a.referenceDir, `${id} missing referenceDir`);
  if (outsideChain.has(id)) continue;
  assert.ok(readFileSync(`course-src/${a.referenceDir}/README.md`, 'utf8').length > 180, `${id} README incomplete`);
  assert.ok(a.transfer?.id === `${id}-transfer` && a.transfer.files?.length === 1 && a.transfer.rubric?.length >= 2, `${id} transfer/rubric missing`);
  if (a.checks.includes('behavior') && !['local', 'rubric'].includes(a.environment) && a.studentSuite !== true) {
    assert.equal(a.behaviorTestPath, '__devpath_protected_behavior__.js', `${id} missing protected submitted-behavior gate`);
  }
}
assert.equal(source['22.07'].studentSuite, true);
assert.equal(source['22.07'].studentSuiteKind, 'types');
assert.equal(source['21.09'].environment, 'dom');
assert.ok(source['20.07'].mutantDirs.some(m => m.id === 'buffered-incremental-consumer'), '20.07 semantic mutant declaration lost');
assert.ok(source['21.08'].correctFiles.some(file => file.path === 'native-using.test.mjs'));
assert.ok(readFileSync('course-src/solutions/21.08/native-using.mjs', 'utf8').includes('await using'));

const report = {
  generatedAt: new Date().toISOString(), runs: 2, steps,
  stableOutputCount: Object.keys(secondSnapshot).length, ids: ids.length,
  first: first.map(({command, exitCode}) => ({command, exitCode})),
  second: second.map(({command, exitCode}) => ({command, exitCode})),
};
const out = 'output/learning-execution/task-9-canonical-regeneration.json';
mkdirSync(path.dirname(out), {recursive: true});
writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
console.log(`Canonical Task9 generation stable across two runs (${report.stableOutputCount} file hashes, ${ids.length} IDs).`);
