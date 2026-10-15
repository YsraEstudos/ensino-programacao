import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {loadTsModule} from './load-ts-module.mjs';
import {after} from 'node:test';
import {webcrypto} from 'node:crypto';
import vm from 'node:vm';
import * as esbuild from 'esbuild-wasm';
import {parse as acornParse} from 'acorn';
import {setup} from './course-runner-harness.mjs';

await import('../public/review-schedule.js');
await import('../public/review-selection.js');
const schedule = globalThis.DevPathReviewSchedule;
const selection = globalThis.DevPathReviewSelection;
const contract = JSON.parse(readFileSync('lib/progress-contract.json', 'utf8'));
const {courseExerciseIds: catalog} = loadTsModule('lib/course-exercise-ids.ts');
const sanitizeModule = loadTsModule('lib/progress-sanitize.ts');
const learning = loadTsModule('lib/learning-progress.ts');
const DAY = 86400000;
const T0 = Date.UTC(2026, 9, 4);
const EXEC = {snippet: true, behavior: new Set(['javascript', 'dom'])};
const NO_EXEC = {snippet: false, behavior: new Set()};

// A controlled clock: time only moves when the test advances it.
function controlledClock(start = T0) {
  let now = start;
  return {now: () => now, advanceDays: days => { now += days * DAY; return now; }};
}

function variant(id, overrides = {}) {
  const base = {
    variantId: `var.${id}.${overrides.slug || 'base'}`, conceptId: 'concept', sourceActivityId: id, prerequisites: [id],
    format: 'choice-predict', environment: 'javascript', evaluator: 'choice', bands: [], transferDecision: 'decisão',
    contentVersion: 1, prompt: 'Qual o resultado?', choices: ['10', '20', '30'], answer: 1,
    feedback: {correct: 'Certo.', byChoice: {'0': 'Você leu o operador errado.', '2': 'Confira a ordem.'}}
  };
  const merged = {...base, ...overrides};
  if (merged.format === 'predict-code') Object.assign(merged, {evaluator: 'output-match', environment: 'javascript', code: 'console.log(1 + 2)', ...overrides});
  if (merged.format === 'short-fix' || merged.format === 'mini-impl') {
    Object.assign(merged, {evaluator: 'behavior', entryPath: 'x.js', starterFiles: {'x.js': 'export const x = 0;\n'}, tests: 'test body', ...overrides});
  }
  return merged;
}

function bank(overrides = {}) {
  return [
    variant('07.03', {slug: 'choice', format: 'choice-predict', evaluator: 'choice'}),
    variant('07.03', {slug: 'predict', format: 'predict-code', evaluator: 'output-match', environment: 'javascript'}),
    variant('07.03', {slug: 'fix', format: 'short-fix', evaluator: 'behavior', environment: 'javascript'}),
    ...(overrides.extra || [])
  ];
}

// Sequence of picks for one activity, feeding each graded choice back into the alternation rule.
function pickSequence(variants, seed, steps, context = {}) {
  const random = selection.seededRandom(seed);
  const last = {...(context.lastByActivity || {})};
  const picks = [];
  for (let step = 0; step < steps; step += 1) {
    const choice = selection.chooseReview({candidates: ['07.03'], variants, studied: ['07.03'], executors: EXEC, lastByActivity: last, random});
    picks.push(choice);
    last['07.03'] = {variantId: choice.variant.variantId, format: choice.format};
  }
  return picks;
}

test('review intervals follow 7, 14, 30 and 60 days on a controlled clock, with next-day retry after error', () => {
  const clock = controlledClock();
  let state = schedule.initial(clock.now());
  assert.equal(state.dueAt - clock.now(), 7 * DAY);

  const steps = [];
  for (const passed of [true, true, true, true, true]) {
    clock.advanceDays(state.dueAt - clock.now() > 0 ? (state.dueAt - clock.now()) / DAY : 0);
    state = schedule.next(state, passed, clock.now());
    steps.push((state.dueAt - clock.now()) / DAY);
  }
  assert.deepEqual(steps, [14, 30, 60, 60, 60], 'last interval is kept after success');

  clock.advanceDays(60);
  state = schedule.next(state, false, clock.now());
  assert.equal(state.dueAt - clock.now(), DAY, 'an error is due again the next day');
  clock.advanceDays(1);
  state = schedule.next(state, true, clock.now());
  assert.equal(state.dueAt - clock.now(), 7 * DAY, 'recovery after an error restarts at seven days');
});

test('seeded selection alternates variants and formats and never repeats the same variant when an alternative exists', () => {
  const variants = bank();
  const picks = pickSequence(variants, 42, 60);
  for (let index = 1; index < picks.length; index += 1) {
    const previous = picks[index - 1].variant.variantId;
    assert.notEqual(picks[index].variant.variantId, previous, `immediate repetition at step ${index}`);
  }
  const formats = new Set(picks.map(pick => pick.format));
  assert.equal(formats.size, 3, 'all eligible formats appear over a run');
  for (let index = 1; index < picks.length; index += 1) {
    const previous = picks[index - 1];
    const alternative = variants.some(item => item.variantId !== previous.variant.variantId && item.format !== previous.format);
    if (alternative) assert.notEqual(picks[index].format, previous.format, `format repeated at step ${index} with an alternative`);
  }
  assert.deepEqual(pickSequence(variants, 42, 60).map(pick => pick.variant.variantId), picks.map(pick => pick.variant.variantId), 'same seed, same sequence');
});

test('selection resumes after reload from serialized schedules and attempts, and a pending attempt is restored, not reselected', () => {
  const clock = controlledClock();
  const variants = bank();
  const first = pickSequence(variants, 7, 1)[0];
  const attempts = selection.startAttempt({}, first.variant, clock.now());
  const draftTyped = 'typed before reload';
  attempts[first.variant.variantId].draft = draftTyped;
  const progress = {reviewSchedule: {'07.03': {intervalIndex: 0, dueAt: clock.now() - DAY, lastVariantId: first.variant.variantId, lastFormat: first.format}}, reviewAttempts: attempts};

  const restored = JSON.parse(JSON.stringify(progress));
  const resumed = selection.reconcileAttempts({attempts: restored.reviewAttempts, variants, activityId: '07.03', studied: ['07.03'], executors: EXEC});
  assert.equal(resumed.resumeVariantId, first.variant.variantId);
  assert.equal(resumed.attempts[first.variant.variantId].draft, draftTyped);

  const last = selection.lastByActivity(restored.reviewSchedule, restored.reviewAttempts);
  const next = pickSequence(variants, 99, 1, {lastByActivity: last})[0];
  assert.notEqual(next.variant.variantId, first.variant.variantId, 'after reload the last variant is not repeated immediately');
});

test('a changed contentVersion re-evaluates the attempt and keeps the old one in history', () => {
  const variants = bank().map(item => item.variantId.endsWith('.choice') ? {...item, contentVersion: 2} : item);
  const attempts = selection.startAttempt({}, bank()[0], T0);
  const result = selection.reconcileAttempts({attempts, variants, activityId: '07.03', studied: ['07.03'], executors: EXEC});
  assert.equal(result.resumeVariantId, null);
  assert.equal(result.attempts[`${bank()[0].variantId}@v1`].contentVersion, 1, 'old version is archived, not discarded');
  assert.equal(result.attempts[bank()[0].variantId], undefined);
});

test('eligibility matrix: local and rubric environments never get execution formats; executors gate browser formats', () => {
  const base = {studied: new Set(['07.03']), optional: new Set(), optIn: false};
  const cases = [
    [variant('07.03', {environment: 'rubric', format: 'choice-predict'}), EXEC, true],
    [variant('07.03', {environment: 'rubric', format: 'predict-code', evaluator: 'output-match'}), EXEC, true],
    [variant('07.03', {environment: 'rubric', format: 'short-fix', evaluator: 'behavior'}), EXEC, false],
    [variant('07.03', {environment: 'node-local', format: 'mini-impl', evaluator: 'behavior'}), EXEC, false],
    [variant('07.03', {environment: 'typescript', format: 'short-fix', evaluator: 'behavior'}), EXEC, false],
    [variant('07.03', {environment: 'dom', format: 'short-fix', evaluator: 'behavior'}), EXEC, true],
    [variant('07.03', {environment: 'javascript', format: 'mini-impl', evaluator: 'behavior'}), NO_EXEC, false],
    [variant('07.03', {environment: 'javascript', format: 'predict-code', evaluator: 'output-match'}), NO_EXEC, false],
    [variant('07.03', {environment: 'javascript', format: 'choice-predict'}), NO_EXEC, true]
  ];
  for (const [item, executors, expected] of cases) {
    assert.equal(selection.isEligible(item, {...base, executors, variants: []}), expected, `${item.format}/${item.environment}`);
  }
});

test('no compatible executor falls back to the legacy card with a limit note; no variants does too', () => {
  const onlyExecution = [variant('07.03', {format: 'short-fix', evaluator: 'behavior', environment: 'javascript'})];
  const fallback = selection.chooseReview({candidates: ['07.03'], variants: onlyExecution, studied: ['07.03'], executors: NO_EXEC});
  assert.equal(fallback.kind, 'legacy');
  assert.equal(fallback.limitNote, selection.LIMIT_NOTES.ineligible);

  const empty = selection.chooseReview({candidates: ['07.03'], variants: [], studied: ['07.03'], executors: EXEC});
  assert.equal(empty.kind, 'legacy');
  assert.equal(empty.limitNote, selection.LIMIT_NOTES.none);

  const malformed = selection.chooseReview({candidates: ['07.03'], variants: [variant('07.03', {answer: 9})], studied: ['07.03'], executors: EXEC});
  assert.equal(malformed.kind, 'legacy', 'a choice answer outside the choices is never offered');
});

test('optional activities are used only with opt-in, never counted as core, and never bypass prerequisites', () => {
  const optionalBank = [variant('07.03', {slug: 'opt'}), variant('08.01', {slug: 'other'})];
  const common = {candidates: ['07.03'], variants: optionalBank, studied: ['07.03'], optional: ['07.03'], executors: EXEC};
  const withoutOptIn = selection.chooseReview({...common, optIn: false});
  assert.equal(withoutOptIn.kind, 'legacy');
  const withOptIn = selection.chooseReview({...common, optIn: true});
  assert.equal(withOptIn.kind, 'variant');
  assert.equal(withOptIn.counted, false);

  const missingPrereq = [variant('08.01', {prerequisites: ['07.03', '07.05']})];
  const blocked = selection.chooseReview({candidates: ['08.01'], variants: missingPrereq, studied: ['07.03', '08.01'], executors: EXEC});
  assert.equal(blocked.kind, 'legacy', 'a missing prerequisite blocks the variant');
});

test('each format grades correct and incorrect answers with the executed reference, not text comparison', async () => {
  const choice = variant('07.03');
  assert.equal((await selection.grade(choice, '1', {})).result, 'passed');
  const wrong = await selection.grade(choice, '0', {});
  assert.equal(wrong.result, 'failed');
  assert.equal(wrong.feedback, 'Você leu o operador errado.');
  assert.equal((await selection.grade(choice, '', {})).result, null);

  const calls = [];
  const predict = variant('07.03', {format: 'predict-code', evaluator: 'output-match', environment: 'javascript', code: 'console.log(1 + 2)'});
  const runSnippet = async code => { calls.push(code); return {kind: 'result', text: '3\n'}; };
  assert.equal((await selection.grade(predict, '3', {runSnippet})).result, 'passed');
  assert.equal((await selection.grade(predict, ' 3  \r\n', {runSnippet})).result, 'passed', 'whitespace at line ends is not a difference');
  assert.equal((await selection.grade(predict, '4', {runSnippet})).result, 'failed');
  assert.deepEqual(calls, ['console.log(1 + 2)', 'console.log(1 + 2)', 'console.log(1 + 2)'], 'reference is executed for each answer');
  assert.equal((await selection.grade(predict, '3', {runSnippet: async () => ({kind: 'error', text: 'boom'})})).result, null);

  for (const format of ['short-fix', 'mini-impl']) {
    const fix = variant('07.03', {format, evaluator: 'behavior', environment: 'javascript'});
    const seen = [];
    const runBehavior = async ({variant: v, files}) => { seen.push(files); return {kind: draftPasses(files) ? 'passed' : 'failed', text: 'resultado'}; };
    const draftPasses = files => files.find(file => file.path === 'x.js').content.includes('return 1');
    assert.equal((await selection.grade(fix, 'export const x = () => { return 1; };', {runBehavior})).result, 'passed', format);
    assert.equal((await selection.grade(fix, 'export const x = 0;', {runBehavior})).result, 'failed', format);
    assert.equal((await selection.grade(fix, 'export const x = 0;', {runBehavior: async () => ({kind: 'unsupported', text: 'x'})})).result, null, format);
    assert.equal(seen[0].find(file => file.path === 'x.js').content.includes('return 1'), true, 'learner code reaches the runner');
  }
});

test('a wrong answer, feedback, and a retry grade without marking the review as demonstrated', async () => {
  const clock = controlledClock();
  const item = variant('07.03');
  const progress = {answers: {'07.03': true}, exerciseEvidence: {}, exerciseLearning: {}, reviewSchedule: {'07.03': {intervalIndex: 0, dueAt: clock.now() - DAY}}, reviewAttempts: {}};
  progress.reviewAttempts = selection.startAttempt(progress.reviewAttempts, item, clock.now());

  const first = await selection.grade(item, '0', {});
  const recordedFirst = selection.recordCheck({schedule: progress.reviewSchedule['07.03'], attempt: progress.reviewAttempts[item.variantId], variant: item, draft: '0', result: first.result, now: clock.now(), scheduled: true});
  progress.reviewAttempts[item.variantId] = recordedFirst.attempt;
  progress.reviewSchedule['07.03'] = recordedFirst.schedule;
  assert.equal(recordedFirst.firstCheck, true);
  assert.equal(progress.reviewSchedule['07.03'].dueAt - clock.now(), DAY, 'wrong answer is due tomorrow');
  assert.equal(progress.reviewSchedule['07.03'].history.length, 1);

  const retry = await selection.grade(item, '1', {});
  const recordedRetry = selection.recordCheck({schedule: progress.reviewSchedule['07.03'], attempt: progress.reviewAttempts[item.variantId], variant: item, draft: '1', result: retry.result, now: clock.now() + 60000, scheduled: true});
  progress.reviewAttempts[item.variantId] = recordedRetry.attempt;
  assert.equal(recordedRetry.firstCheck, false);
  assert.equal(recordedRetry.attempt.status, 'passed');
  assert.equal(recordedRetry.schedule, progress.reviewSchedule['07.03'], 'retry does not move the schedule');

  assert.deepEqual(progress.exerciseEvidence, {});
  assert.deepEqual(progress.exerciseLearning, {});
  assert.equal(JSON.stringify(progress).includes('demonstrated'), false);
});

test('sanitize accepts old progress without review fields and keeps valid new fields, dropping invalid ones', () => {
  const old = {answers: {'07.03': true}, reviewSchedule: {'07.03': {intervalIndex: 1, dueAt: T0 + DAY * 14}}};
  const fromOld = sanitizeModule.sanitizeUserProgressWithReport(old);
  assert.deepEqual(fromOld.progress.reviewAttempts, {});
  assert.equal(fromOld.progress.reviewSchedule['07.03'].lastVariantId, undefined);
  assert.equal(fromOld.report.droppedReviewAttempts, 0);

  const variantId = 'var.07.03.choice';
  const attempt = {activityId: '07.03', contentVersion: 1, format: 'choice-predict', draft: '1', status: 'passed', usedHelp: true, startedAt: T0, finishedAt: T0 + 5};
  const input = {
    reviewSchedule: {'07.03': {intervalIndex: 1, dueAt: T0 + DAY * 14, lastVariantId: variantId, lastFormat: 'choice-predict',
      history: [{variantId, format: 'choice-predict', result: 'passed', at: new Date(T0).toISOString()}, {variantId: 'bad', format: 'choice-predict', result: 'passed', at: 'x'}]}},
    reviewAttempts: {
      [variantId]: attempt,
      'var.07.03.long': {...attempt, draft: 'x'.repeat(contract.limits.draftChars + 500)},
      'var.08.01.other': {...attempt},
      'var.07.03.badformat': {...attempt, format: 'essay'},
      '07.03': {...attempt}
    }
  };
  const clean = sanitizeModule.sanitizeUserProgress(input);
  assert.deepEqual(Object.keys(clean.reviewAttempts).sort(), [variantId, 'var.07.03.long'].sort());
  assert.equal(clean.reviewAttempts['var.07.03.long'].draft.length, contract.limits.draftChars);
  assert.equal(clean.reviewSchedule['07.03'].lastVariantId, variantId);
  assert.equal(clean.reviewSchedule['07.03'].history.length, 1, 'invalid history entries are dropped');
  assert.equal(clean.reviewAttempts[variantId].usedHelp, true);
});

test('merge keeps the newer attempt and the schedule with the later review, and round-trips through sanitize', () => {
  const variantId = 'var.07.03.choice';
  const older = {activityId: '07.03', contentVersion: 1, format: 'choice-predict', draft: '0', status: 'failed', usedHelp: false, startedAt: T0, finishedAt: T0 + 1};
  const newer = {...older, draft: '1', status: 'passed', finishedAt: T0 + 9};
  const local = {reviewAttempts: {[variantId]: newer}, reviewSchedule: {'07.03': {intervalIndex: 1, dueAt: T0 + 14 * DAY, lastReviewedAt: new Date(T0 + 9).toISOString(), lastVariantId: variantId}}};
  const remote = {reviewAttempts: {[variantId]: older, 'var.08.01.x': {...older, activityId: '08.01', draft: 'remote-only'}}, reviewSchedule: {'07.03': {intervalIndex: 0, dueAt: T0 + 7 * DAY, lastReviewedAt: new Date(T0 + 1).toISOString()}}};
  const merged = learning.mergeProgressSnapshotsWithReport(local, remote);
  assert.equal(merged.progress.reviewAttempts[variantId].draft, '1');
  assert.equal(merged.progress.reviewAttempts['var.08.01.x'].draft, 'remote-only');
  assert.equal(merged.progress.reviewSchedule['07.03'].intervalIndex, 1);
  assert.equal(merged.droppedReviewAttempts, 0);

  const oldRemote = learning.mergeProgressSnapshotsWithReport({answers: {'07.03': true}}, {reviewSchedule: {'07.03': {intervalIndex: 0, dueAt: 1}}});
  assert.equal(oldRemote.progress.reviewSchedule['07.03'].dueAt, 1, 'old schedules without review fields still merge');
  const roundTrip = sanitizeModule.sanitizeUserProgress(merged.progress);
  assert.deepEqual(roundTrip.reviewAttempts, sanitizeModule.sanitizeUserProgress(JSON.parse(JSON.stringify(roundTrip))).reviewAttempts);
  assert.equal(roundTrip.reviewAttempts[variantId].status, 'passed');
});

test('payload with realistic review attempts stays under requestBytes and the attempt budget is visible when exceeded', () => {
  const limit = contract.limits.requestBytes;
  const at = new Date(T0).toISOString();
  const learningRecords = Object.fromEntries(catalog.map((id, index) => [id, {
    schemaVersion: 1, contentVersion: 1, assessmentVersion: 1, mode: 'learn', state: 'attempted', assisted: true,
    attemptId: `attempt-${id}`, attemptIndependent: false, currentFingerprint: `sha256:${id}`,
    currentUpdatedAt: new Date(Date.parse(at) + index * 1000).toISOString(),
    events: [{id: `start-${id}`, kind: 'attempted', attemptId: `attempt-${id}`, at, fingerprint: `sha256:${id}`, source: 'browser'}]
  }]));
  const reviewSchedule = Object.fromEntries(catalog.map(id => [id, {
    intervalIndex: 1, dueAt: T0 + 14 * DAY, lastReviewedAt: at, lastVariantId: `var.${id}.a`, lastFormat: 'short-fix',
    history: Array.from({length: contract.limits.reviewHistory}, (_, i) => ({variantId: `var.${id}.a`, format: 'short-fix', result: i % 2 ? 'passed' : 'failed', at}))
  }]));
  const reviewAttempts = {};
  catalog.slice(0, 100).forEach((id, index) => {
    reviewAttempts[`var.${id}.a`] = {activityId: id, contentVersion: 1, format: 'mini-impl', draft: 'c'.repeat(900), status: index % 3 ? 'passed' : 'failed', usedHelp: index % 4 === 0, startedAt: T0 + index, finishedAt: T0 + index + 5};
  });
  for (const id of catalog.slice(0, 5)) {
    reviewAttempts[`var.${id}.pending`] = {activityId: id, contentVersion: 1, format: 'short-fix', draft: 'p'.repeat(4000), status: 'pending', usedHelp: false, startedAt: T0, finishedAt: 0};
  }
  const realistic = sanitizeModule.sanitizeUserProgressWithReport({exerciseLearning: learningRecords, reviewSchedule, reviewAttempts});
  const bytes = Buffer.byteLength(JSON.stringify(realistic.progress));
  assert.equal(realistic.report.droppedReviewAttempts, 0, 'a realistic learner keeps every attempt');
  assert.equal(Object.keys(realistic.progress.reviewAttempts).length, 105);
  assert.ok(bytes < limit, `realistic save is ${bytes} bytes, above requestBytes ${limit}`);

  const worst = {};
  catalog.forEach((id, index) => {
    for (let slot = 0; slot < 3; slot += 1) worst[`var.${id}.s${slot}`] = {activityId: id, contentVersion: 1, format: 'short-fix', draft: 'w'.repeat(contract.limits.draftChars), status: 'failed', usedHelp: true, startedAt: index, finishedAt: index + slot + 1};
  });
  const bounded = sanitizeModule.sanitizeUserProgressWithReport({reviewAttempts: worst});
  const attemptChars = JSON.stringify(bounded.progress.reviewAttempts).length;
  assert.ok(attemptChars <= contract.limits.reviewPayloadChars, `attempts use ${attemptChars} chars, above reviewPayloadChars`);
  assert.ok(Object.keys(bounded.progress.reviewAttempts).length <= contract.limits.reviewAttempts);
  assert.ok(bounded.report.droppedReviewAttempts > 0, 'over budget is reported, not silent');
  assert.equal(bounded.report.truncated, true);
  assert.ok(Buffer.byteLength(JSON.stringify(bounded.progress)) < limit);
});

test('pending drafts survive the attempt budget before finished attempts are dropped', () => {
  const at = T0;
  const attempts = {};
  for (let index = 0; index < 60; index += 1) {
    attempts[`var.07.03.f${index}`] = {activityId: '07.03', contentVersion: 1, format: 'mini-impl', draft: 'f'.repeat(contract.limits.draftChars), status: 'passed', usedHelp: false, startedAt: at + index, finishedAt: at + index + 1};
  }
  attempts['var.07.03.draft'] = {activityId: '07.03', contentVersion: 1, format: 'mini-impl', draft: 'unsaved work', status: 'pending', usedHelp: false, startedAt: at, finishedAt: 0};
  const bounded = sanitizeModule.sanitizeUserProgressWithReport({reviewAttempts: attempts});
  assert.equal(bounded.progress.reviewAttempts['var.07.03.draft'].draft, 'unsaved work');
  assert.ok(bounded.report.droppedReviewAttempts > 0);
});

// Published bank: every variant must be offered by the controller's eligibility checks (list-shaped starter files included).
const published = JSON.parse(readFileSync('public/course-variants.json', 'utf8')).variants;

test('every published review variant is well formed and both starter shapes are read', () => {
  assert.ok(published.length > 0);
  assert.equal(published.filter(selection.wellFormed).length, published.length);
  const listShaped = published.find(item => Array.isArray(item.starterFiles));
  assert.ok(listShaped, 'the bank publishes starter files as lists');
  assert.equal(selection.starterOf(listShaped), listShaped.starterFiles.find(file => file.path === listShaped.entryPath).content);
  assert.equal(selection.starterOf(variant('07.03', {entryPath: 'x.js', starterFiles: {'x.js': 'map'}})), 'map');
});

// Real execution: the same moduleGraph/course runner stack the site uses, with the controller's behavior request.
const moduleGraph = (() => { const w = {TextEncoder}; w.window = w; vm.runInThisContext('(function(window){' + readFileSync('public/module-graph.js', 'utf8') + '})')(w); return w.DevPathModuleGraph; })();
const runnerEnv = setup();
after(async () => { await runnerEnv.close(); await esbuild.stop(); });

function reviewAssessment() {
  const w = {TextEncoder, crypto: webcrypto, DevPathCompilerEngine: {parse: acornParse}};
  w.window = w;
  w.DevPathModuleGraph = {buildModuleGraph: input => moduleGraph.buildModuleGraph(input, {build: esbuild.build, parse: acornParse, transform: esbuild.transform, runtime: input.runtime})};
  w.DevPathCourseRunner = {run: (code, finish, options) => runnerEnv.w.DevPathCourseRunner.run(code, finish, options)};
  vm.runInNewContext(readFileSync('public/course-case-markers.js', 'utf8'), w);
  vm.runInNewContext(readFileSync('public/course-assessment.js', 'utf8'), w);
  return w.DevPathAssessment;
}

function filesWithEntry(variant, content) {
  return Object.entries(selection.fileMap(variant.starterFiles)).map(([path, original]) => ({path, content: path === variant.entryPath ? content : original}));
}

test('a published short-fix and a mini-impl variant pass with the reference and fail with the starter through DevPathAssessment.run', async () => {
  const assessment = reviewAssessment();
  for (const format of ['short-fix', 'mini-impl']) {
    const variant = published.find(item => item.format === format);
    assert.ok(variant, `a published ${format} variant exists`);
    assert.equal(variant.environment, 'javascript');
    const reference = variant.correctFiles.find(file => file.path === variant.entryPath).content;
    const passing = await assessment.run(selection.behaviorRequest(variant, filesWithEntry(variant, reference)));
    assert.equal(passing.kind, 'passed', `${variant.variantId} reference: ${passing.text}`);
    const failing = await assessment.run(selection.behaviorRequest(variant, filesWithEntry(variant, selection.starterOf(variant))));
    // A starter that does not parse (a short-fix whose bug is the syntax error) reports 'error'; grading treats it as failed.
    assert.ok(['failed', 'error'].includes(failing.kind), `${variant.variantId} starter: ${failing.text}`);
    const graded = await selection.grade(variant, selection.starterOf(variant), {runBehavior: ({variant: item, files}) => assessment.run(selection.behaviorRequest(item, files))});
    assert.equal(graded.result, 'failed', `${variant.variantId} graded starter`);
  }
});

test('reviewOptIn defaults to false in sanitized progress and keeps only a boolean true', () => {
  assert.equal(sanitizeModule.sanitizeUserProgress({}).reviewOptIn, false);
  assert.equal(sanitizeModule.sanitizeUserProgress({reviewOptIn: true}).reviewOptIn, true);
  assert.equal(sanitizeModule.sanitizeUserProgress({reviewOptIn: 'yes'}).reviewOptIn, false);
});
