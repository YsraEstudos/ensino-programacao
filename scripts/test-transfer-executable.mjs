import test, {before, after} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {JSDOM} from 'jsdom';
import {loadTsModule} from './load-ts-module.mjs';
import {createContext} from './gate-execucao.mjs';

// Executable transfer (item 0.2 / Fase 6): the learner's code runs with the same evaluator as the main activity,
// against the published suite of 08.03-transfer-primeira. Only a pass without help, on a verified main attempt,
// is recorded as "demonstrated". Rubric transfers stay transfer-declared.

const learning = loadTsModule('lib/learning-progress.ts');
const catalog = JSON.parse(readFileSync('public/course-catalog.json', 'utf8'));
const published = JSON.parse(readFileSync('public/course-assessments.json', 'utf8'));
const ID = '08.03';
const main = catalog.find(item => item.id === ID);
const assessment = published[ID];
const transfer = assessment.transfer;
const MAIN_FP = 'main-fingerprint';

const CORRECT = `export function primeira(xs, alvo) {
  let lo = 0, hi = xs.length - 1, achado = -1;
  while (lo <= hi) {
    const meio = Math.floor((lo + hi) / 2);
    if (xs[meio] === alvo) { achado = meio; hi = meio - 1; }
    else if (xs[meio] < alvo) lo = meio + 1;
    else hi = meio - 1;
  }
  return achado;
}
`;
// Plausible wrong answer: returns the last occurrence (fails the first-occurrence test).
const WRONG = `export function primeira(xs, alvo) { return xs.lastIndexOf(alvo); }\n`;
// The real mutant: stops at the first hit found by halving, so duplicates are not left-searched.
const MUTANT = `export function primeira(xs, alvo) {
  let lo = 0, hi = xs.length - 1;
  while (lo <= hi) {
    const meio = Math.floor((lo + hi) / 2);
    if (xs[meio] === alvo) return meio;
    if (xs[meio] < alvo) lo = meio + 1; else hi = meio - 1;
  }
  return -1;
}
`;
const filesWith = content => transfer.files.map(file => ({path: file.path, content}));

let ctx;
let canonicalFingerprint;
let dom;
let api;

before(async () => {
  ctx = await createContext();
  const scope = {TextEncoder, crypto: webcrypto};
  scope.window = scope;
  vm.runInNewContext(readFileSync('public/course-assessment.js', 'utf8'), scope);
  canonicalFingerprint = scope.DevPathAssessment.canonicalFingerprint;
  dom = new JSDOM('<div id="host"></div>', {runScripts: 'outside-only', url: 'https://devpath.test/'});
  dom.window.eval(readFileSync('public/learning-paths.js', 'utf8'));
  api = dom.window.DevPathLearningPaths;
}, {timeout: 180000});

after(async () => {
  await ctx?.close();
  dom?.window.close();
});

// Mirrors app.js transitionLearning: the same reducer, monotonic timestamps, the same context fields.
function harness() {
  let record = null;
  let clock = Date.parse('2026-10-15T10:00:00.000Z');
  let sequence = 0;
  const event = (kind, options = {}) => {
    clock += 1000;
    const fingerprint = options.fingerprint;
    const learningEvent = {
      id: `ev-${++sequence}`, kind, attemptId: options.attemptId || record?.attemptId,
      at: new Date(clock).toISOString(), fingerprint, source: options.source || 'browser',
      ...(typeof options.assisted === 'boolean' ? {assisted: options.assisted} : {})
    };
    record = learning.transitionLearning(record, learningEvent, {
      contentVersion: main.contentVersion || 1, assessmentVersion: assessment.version || 1, fingerprint,
      independent: options.independent ?? record?.attemptIndependent ?? true,
      assessmentPassed: options.assessmentPassed === true, mode: 'recall'
    });
    return record;
  };
  return {event, record: () => record};
}

function verifiedMain() {
  const h = harness();
  h.event('attempted', {attemptId: 'main-attempt', fingerprint: MAIN_FP, source: 'browser', independent: true});
  h.event('verified', {attemptId: 'main-attempt', fingerprint: MAIN_FP, source: 'browser', assessmentPassed: true, independent: true});
  assert.equal(h.record().state, 'verified', 'fixture: the main activity is verified');
  return h;
}

function runner(h, {evaluate = input => ctx.evaluate(input), attempts = {n: 0}} = {}) {
  return files => api.runExecutableTransfer({
    item: main, transfer, files, assessment,
    current: () => h.record(),
    event: (kind, options) => h.event(kind, options),
    evaluate,
    fingerprint: input => canonicalFingerprint(input),
    newId: () => `transfer-attempt-${++attempts.n}`,
    contentVersion: main.contentVersion || 1,
    assessmentVersion: assessment.version || 1
  });
}

test('the published 08.03 transfer is executable, with its own problem, files and suite', () => {
  assert.equal(transfer.execution, 'browser');
  assert.notEqual(transfer.id, assessment.testPath);
  assert.equal(transfer.files.length, 1);
  assert.equal(transfer.files[0].path, 'transfer.js');
  assert.match(transfer.tests, /primeira/);
  assert.equal(published['11.01'].transfer.execution, undefined, 'rubric transfers are not executable');
  assert.equal(api.executableTransfer(transfer), true);
  assert.equal(api.executableTransfer(published['11.01'].transfer), false);
});

test('the real mutant fails the published suite, and the reference passes it', async () => {
  const reference = await ctx.evaluate({item: {id: transfer.id}, assessment: api.transferAssessment(transfer), files: filesWith(CORRECT), fingerprint: 'reference'});
  const mutant = await ctx.evaluate({item: {id: transfer.id}, assessment: api.transferAssessment(transfer), files: filesWith(MUTANT), fingerprint: 'mutant'});
  assert.equal(reference.kind, 'passed');
  assert.equal(reference.source, 'browser');
  assert.equal(mutant.kind, 'failed', 'the published suite kills the mutant');
});

test('a wrong answer is rejected and records nothing', async () => {
  const h = verifiedMain();
  const before = JSON.stringify(h.record());
  const result = await runner(h)(filesWith(WRONG));
  assert.equal(result.accepted, false);
  assert.equal(result.reason, 'not-passed');
  assert.equal(result.kind, 'failed');
  assert.equal(JSON.stringify(h.record()), before, 'a failed run leaves the learning record untouched');
  assert.equal(h.record().demonstratedEvidence, undefined);
});

test('the untouched starter is rejected as well', async () => {
  const h = verifiedMain();
  const result = await runner(h)(filesWith(transfer.files[0].content));
  assert.equal(result.accepted, false);
  assert.equal(h.record().state, 'verified');
});

test('a correct independent implementation is approved and recorded as demonstrated with versions and fingerprint', async () => {
  const h = verifiedMain();
  const result = await runner(h)(filesWith(CORRECT));
  assert.equal(result.accepted, true);
  assert.equal(result.state, 'demonstrated');
  const record = h.record();
  assert.equal(record.state, 'demonstrated');
  const evidence = record.demonstratedEvidence;
  assert.equal(evidence.source, 'browser');
  assert.equal(evidence.contentVersion, main.contentVersion);
  assert.equal(evidence.assessmentVersion, assessment.version);
  assert.equal(evidence.fingerprint, await canonicalFingerprint({activityId: transfer.id, contentVersion: main.contentVersion || 1, assessmentVersion: transfer.version, assessment: api.transferAssessment(transfer), files: filesWith(CORRECT)}));
  assert.notEqual(evidence.attemptId, 'main-attempt', 'the transfer is its own attempt');
  assert.notEqual(evidence.fingerprint, MAIN_FP);
});

test('with help on the main attempt the transfer is not run and not demonstrated', async () => {
  const h = verifiedMain();
  h.event('help', {attemptId: 'main-attempt', fingerprint: MAIN_FP, source: 'rubric-declared', assisted: true});
  let calls = 0;
  const result = await runner(h, {evaluate: async input => { calls++; return ctx.evaluate(input); }})(filesWith(CORRECT));
  assert.equal(result.accepted, false);
  assert.equal(result.reason, 'principal');
  assert.equal(calls, 0);
  assert.notEqual(h.record().state, 'demonstrated');
});

test('help requested while the transfer runs prevents the demonstration', async () => {
  const h = verifiedMain();
  const result = await runner(h, {evaluate: async input => {
    h.event('help', {attemptId: 'main-attempt', fingerprint: MAIN_FP, source: 'rubric-declared', assisted: true});
    return ctx.evaluate(input);
  }})(filesWith(CORRECT));
  assert.equal(result.accepted, false);
  assert.equal(result.reason, 'changed');
  assert.equal(h.record().demonstratedEvidence, undefined);
  assert.notEqual(h.record().state, 'demonstrated');
});

test('a main activity that is not verified never yields demonstrated', async () => {
  const studied = harness();
  studied.event('attempted', {attemptId: 'main-attempt', fingerprint: MAIN_FP, source: 'browser', independent: true});
  let calls = 0;
  const evaluate = async input => { calls++; return ctx.evaluate(input); };
  const attemptOnly = await runner(studied, {evaluate})(filesWith(CORRECT));
  assert.equal(attemptOnly.accepted, false);
  assert.equal(attemptOnly.reason, 'principal');

  const edited = verifiedMain();
  edited.event('attempted', {attemptId: 'main-attempt', fingerprint: 'main-edited', source: 'browser', independent: true});
  const stale = await runner(edited, {evaluate})(filesWith(CORRECT));
  assert.equal(stale.accepted, false);
  assert.equal(calls, 0, 'the evaluator never runs without a verified main attempt');
  assert.equal(edited.record().demonstratedEvidence, undefined);
});

test('rubric transfers are not executed and stay transfer-declared', async () => {
  const h = verifiedMain();
  const rubric = published['11.01'].transfer;
  let calls = 0;
  const result = await api.runExecutableTransfer({
    item: main, transfer: rubric, files: [{path: 'transfer.js', content: CORRECT}], assessment: {...assessment, transfer: rubric},
    current: () => h.record(), event: (kind, options) => h.event(kind, options),
    evaluate: async input => { calls++; return ctx.evaluate(input); }, fingerprint: input => canonicalFingerprint(input),
    newId: () => 'never', contentVersion: main.contentVersion || 1, assessmentVersion: assessment.version || 1
  });
  assert.equal(result.accepted, false);
  assert.equal(result.reason, 'not-executable');
  assert.equal(calls, 0);
  h.event('attempted', {attemptId: 'rubric-attempt', fingerprint: 'rubric-fp', source: 'rubric-declared', independent: true, mode: 'recall'});
  const declared = h.event('transfer-declared', {attemptId: 'rubric-attempt', fingerprint: 'rubric-fp', source: 'rubric-declared', independent: true, assessmentPassed: false});
  assert.equal(declared.state, 'transfer-declared');
  assert.equal(declared.demonstratedEvidence, undefined);
});

test('demonstrated history survives reload and is kept after a later failed retry', async () => {
  const h = verifiedMain();
  await runner(h)(filesWith(CORRECT));
  const reloaded = learning.sanitizeLearningRecord(JSON.parse(JSON.stringify(h.record())));
  assert.equal(reloaded.state, 'demonstrated');
  assert.deepEqual(reloaded.demonstratedEvidence, h.record().demonstratedEvidence);
  assert.ok(reloaded.evidenceHistory.some(item => item.attemptId === h.record().demonstratedEvidence.attemptId));

  const retry = await runner(h)(filesWith(WRONG));
  assert.equal(retry.accepted, false);
  assert.deepEqual(h.record().demonstratedEvidence, reloaded.demonstratedEvidence, 'the earlier demonstration stays as history');
  assert.equal(h.record().state, 'demonstrated');
});

test('the transfer section edits the files and the run button drives runExecutableTransfer end to end', async () => {
  const h = verifiedMain();
  const attempts = {n: 0};
  const runner_ = runner(h, {attempts});
  const context = {
    progress: {exerciseLearning: {[ID]: h.record()}}, assessments: published, render() {}, toast() {},
    learning: {runTransfer: (item, offered, evidence) => runner_(evidence.files)}
  };
  const lesson = '<article class="course-lesson"><a class="lesson-back">Voltar</a><header><h1>Primeira</h1></header><section id="g-learn"><p>Regra ensinada.</p></section></article>';
  const root = dom.window.document.createElement('div');
  root.innerHTML = api.decorate(main, lesson, context);
  const field = root.querySelector('[data-learning-transfer-file="transfer.js"]');
  assert.ok(field, 'the transfer file is editable');
  assert.equal(field.value, transfer.files[0].content, 'the starter is the first draft');
  assert.equal(root.querySelector('[data-learning-transfer-run]').disabled, false);
  field.value = CORRECT;
  const button = root.querySelector('[data-learning-transfer-run]');
  await api.handleClick({target: button, preventDefault() {}}, main, context, root);
  const status = root.querySelector('[data-learning-transfer-status]');
  for (let attempt = 0; attempt < 200 && h.record().state !== 'demonstrated' && !/Transferência aprovada/.test(status.textContent); attempt++) {
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  assert.equal(h.record().state, 'demonstrated');
  assert.match(status.textContent, /Transferência aprovada sem ajuda/);
});
