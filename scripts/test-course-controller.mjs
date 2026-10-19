import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

function deferred() {
  let resolve;
  const promise = new Promise(value => { resolve = value; });
  return {promise, resolve};
}

function passed(label, fingerprint) {
  return {kind: 'passed', text: `${label} passed`, tests: {passed: 1, failed: 0, total: 1}, source: 'browser', fingerprint};
}

function harness() {
  const editor = {value: 'export const answer = 1;', dataset: {courseFile: 'main.js', courseEditor: '04.04'}, matches(selector) { return selector === '.course-editor'; }};
  const output = {isConnected: true, textContent: ''};
  let saves = 0;
  const view = {
    querySelector(selector) { if (selector.includes('data-course-editor')) return editor; if (selector.includes('data-course-output')) return output; return null; },
    querySelectorAll(selector) { return selector.includes('data-course-editor') ? [editor] : []; }
  };
  const item = {id: '04.04', contentVersion: 1, autoTested: true, starterFiles: [{path: 'main.js', content: editor.value}]};
  const ctx = {
    view, activityById: new Map([[item.id, item]]), progress: {exerciseDrafts: {}, exerciseEvidence: {}}, limits: {draftChars: 5000, attemptCount: 5},
    exerciseProgressKey: value => value.id, esc: value => value, isExerciseDone: () => false, requiredActivities: () => [], curriculumActivities: [item],
    saveProgress: () => { saves++; }, toast: () => {}, render: () => {}, reviewSchedule: {initial: () => ({intervalIndex: 0, dueAt: 1})},
    courseSaveTimer: null, cancelCourseRun: null
  };
  const starts = [deferred(), deferred(), deferred()];
  const runs = [];
  const w = {AbortController, CSS: {escape: value => value}, TextEncoder, setTimeout, clearTimeout, console};
  w.window = w;
  w.fetch = async () => ({ok: true, json: async () => ({'04.04': {environment: 'javascript', version: 1, checks: ['behavior'], testPath: '__devpath_tests__.js', tests: 'test("x", () => {});'}})});
  w.DevPathAssessment = {
    canonicalFingerprint({files}) { return Promise.resolve(files.map(file => `${file.path}:${file.content}`).join('|')); },
    run({signal, fingerprint}) {
      const result = deferred();
      const run = {fingerprint, result, arrived: false, aborted: false};
      runs.push(run);
      starts[runs.length - 1]?.resolve(run);
      signal?.addEventListener('abort', () => { run.aborted = true; }, {once: true});
      return result.promise.then(value => { run.arrived = true; return value; });
    }
  };
  vm.runInNewContext(readFileSync('public/course-controller.js', 'utf8'), w);
  const controller = w.DevPathCourseController.create(ctx);
  return {controller, ctx, editor, output, item, starts, runs, resolveRun: (run, result) => run.result.resolve(result), get saves() {return saves;}};
}

test('editing during an assessment cancels it and ignores the late passed callback', async () => {
  const h = harness();
  const pending = h.controller.runCourseJavaScript('04.04');
  const run = await h.starts[0].promise;
  h.editor.value = 'export const answer = 2;';
  h.controller.handleInput({target: h.editor});
  h.resolveRun(run, passed('obsolete', run.fingerprint));
  await pending;
  assert.equal(run.arrived, true);
  assert.deepEqual(h.ctx.progress.exerciseEvidence, {});
  assert.equal(h.saves, 0);
});

test('disposing or explicitly cancelling a run ignores its late passed callback', async () => {
  for (const cancel of ['dispose', 'explicit']) {
    const h = harness();
    const pending = h.controller.runCourseJavaScript('04.04');
    const run = await h.starts[0].promise;
    if (cancel === 'dispose') h.controller.dispose(); else h.ctx.cancelCourseRun();
    h.resolveRun(run, passed('obsolete', run.fingerprint));
    await pending;
    assert.equal(run.arrived, true, cancel);
    assert.deepEqual(h.ctx.progress.exerciseEvidence, {}, cancel);
    assert.equal(h.saves, 0, cancel);
  }
});

test('a changed draft cannot overwrite current evidence after the result arrives', async () => {
  const h = harness();
  const pending = h.controller.runCourseJavaScript('04.04');
  const run = await h.starts[0].promise;
  h.editor.value = 'export const answer = 9;';
  h.resolveRun(run, passed('obsolete', run.fingerprint));
  await pending;
  assert.equal(run.arrived, true);
  assert.deepEqual(h.ctx.progress.exerciseEvidence, {});
  assert.equal(h.saves, 0);
});

test('an obsolete assessment callback cannot save after activity replacement while the current run can', async () => {
  const h = harness();
  const first = h.controller.runCourseJavaScript('04.04');
  const runA = await h.starts[0].promise;
  h.editor.value = 'export const answer = 2;';
  h.ctx.activityById.set('04.04', {...h.item, contentVersion: 2, starterFiles: [{path: 'main.js', content: h.editor.value}]});
  const second = h.controller.runCourseJavaScript('04.04');
  const runB = await h.starts[1].promise;
  assert.notEqual(runA.fingerprint, runB.fingerprint);
  assert.equal(runA.aborted, true, 'obsolete run received cancellation');
  h.resolveRun(runB, passed('current B', runB.fingerprint));
  await second;
  assert.equal(runB.arrived, true, 'current callback arrived');
  assert.equal(h.saves, 1);
  assert.equal(h.output.textContent, 'current B passed');
  assert.equal(h.ctx.progress.exerciseEvidence['04.04'].fingerprint, runB.fingerprint);
  assert.equal(h.ctx.progress.exerciseEvidence['04.04'].output, 'current B passed');
  h.resolveRun(runA, passed('obsolete A', runA.fingerprint));
  await first;
  assert.equal(runA.arrived, true, 'obsolete callback arrived after current approval');
  assert.equal(h.saves, 1);
  assert.equal(h.output.textContent, 'current B passed');
  assert.equal(h.ctx.progress.exerciseEvidence['04.04'].fingerprint, runB.fingerprint);
});

test('assessment result fields are normalized to browser source and caller fingerprint', async () => {
  const h = harness();
  const pending = h.controller.runCourseJavaScript('04.04');
  const run = await h.starts[0].promise;
  h.resolveRun(run, passed('result', run.fingerprint));
  await pending;
  const evidence = h.ctx.progress.exerciseEvidence['04.04'];
  assert.equal(evidence.testsPassed, true);
  assert.equal(evidence.runResult, 'result');
  assert.equal(evidence.fingerprint, run.fingerprint);
  assert.equal(evidence.tests.passed, 1);
  assert.equal(evidence.tests.total, 1);
});

test('first semantic divergence is displayed and persisted with the run evidence', async () => {
  const h = harness();
  const pending = h.controller.runCourseJavaScript('04.04');
  const run = await h.starts[0].promise;
  const firstFailure = {caseId: '04.04.media', matcher: 'toBe', negated: false, inputExpression: 'media(2, 4)', expected: 3, observed: 6, investigation: 'Confira a média.'};
  h.resolveRun(run, {kind: 'failed', text: '1 teste falhou.\nPrimeira divergência · 04.04.media', tests: {passed: 0, failed: 1, total: 1, firstFailure}, firstFailure, fingerprint: run.fingerprint, source: 'browser'});
  await pending;
  assert.match(h.output.textContent, /Primeira divergência · 04\.04\.media/);
  assert.equal(h.ctx.progress.exerciseEvidence['04.04'].testsPassed, false);
  assert.deepEqual(JSON.parse(JSON.stringify(h.ctx.progress.exerciseEvidence['04.04'].firstFailure)), firstFailure);
  assert.match(h.ctx.progress.exerciseEvidence['04.04'].output, /Primeira divergência/);
});

function lessonController(items, assessments, predictions = {}, isDone = () => false) {
  let renders = 0;
  const w = {AbortController, CSS: {escape: value => value}, TextEncoder, console};
  w.window = w;
  w.fetch = async () => ({ok: true, json: async () => assessments});
  vm.runInNewContext(readFileSync('public/structured-predictions.js', 'utf8'), w);
  vm.runInNewContext(readFileSync('public/course-controller.js', 'utf8'), w);
  const ctx = {
    view: {querySelector: () => null, querySelectorAll: () => []}, activityById: new Map(items.map(item => [item.id, item])),
    progress: {exerciseDrafts: {}, exerciseEvidence: {}, exerciseReflections: {}, exercisePredictions: predictions, warmupCompleted: new Proxy({}, {get: () => true})},
    limits: {draftChars: 5000, attemptCount: 5}, exerciseProgressKey: value => value.id, esc: value => value,
    isExerciseDone: isDone, requiredActivities: () => items, curriculumActivities: items, saveProgress: () => {}, toast: () => {},
    render: () => { renders++; }, reviewSchedule: {initial: () => ({intervalIndex: 0, dueAt: 1})}, courseSaveTimer: null, cancelCourseRun: null
  };
  return {controller: w.DevPathCourseController.create(ctx), renders: () => renders, ctx};
}

test('same-count rubric edits keep old checks historical until explicit recheck', async () => {
  const rubric = ['Critério atual A', 'Critério atual B'];
  const currentFingerprint = `sha256:${'b'.repeat(64)}`;
  const oldFingerprint = `sha256:${'a'.repeat(64)}`;
  const item = {id: '09.08', stage: '09', kind: 'PROJECT', contentVersion: 1, rubric, rubricFingerprint: currentFingerprint,
    firstResponse: {action: 'Descreva a implementação.', timing: 'Antes de executar.'},
    explanation: {mental_model: 'm', worked_example: 'w', common_trap: 't', why_it_matters: 'y'},
    starterFiles: [{path: 'main.js', content: 'export const value = 1;'}]};
  const {controller, ctx, renders} = lessonController([item], {'09.08': {environment: 'javascript', version: 1, checks: ['behavior']}}, {}, () => true);
  ctx.progress.exerciseDrafts['09.08'] = 'draft remains';
  ctx.progress.exerciseReflections['09.08'] = 'reflection remains';
  ctx.progress.exerciseEvidence['09.08'] = {status: 'written', runResult: 'guided', output: 'old evidence', rubric: [0, 1], rubricFingerprint: oldFingerprint, runCount: 1};

  controller.renderCurriculumLesson(item);
  await new Promise(resolve => setTimeout(resolve, 0));
  const staleHtml = controller.renderCurriculumLesson(item);
  const staleInputs = [...staleHtml.matchAll(/<input[^>]*data-course-rubric="09\.08"[^>]*>/g)].map(match => match[0]);
  assert.equal(staleInputs.length, 2);
  assert(staleInputs.every(input => !/\bchecked\b/.test(input)), 'same-count old indices do not check current criteria');
  assert.match(staleHtml, /A conclusão anterior continua registrada/);
  const staleCompleteButton = staleHtml.match(/<button[^>]*data-course-complete="09\.08"[^>]*>/)?.[0] || '';
  assert.match(staleCompleteButton, /\sdisabled(?:\s|>)/,
    'same-count historical checks leave completion disabled until explicit recheck');

  let selected = [{value: '0'}];
  ctx.view.querySelectorAll = selector => selector.includes('data-course-rubric') && selector.endsWith(':checked') ? selected : [];
  const target = {dataset: {courseRubric: '09.08'}, matches: selector => selector === '[data-course-rubric]'};
  assert.equal(controller.handleInput({target}, item), true);
  assert.equal(ctx.progress.exerciseEvidence['09.08'].rubricFingerprint, currentFingerprint);
  assert.deepEqual(JSON.parse(JSON.stringify(ctx.progress.exerciseEvidence['09.08'].rubric)), [0]);
  assert.equal(renders(), 1, 'one checked criterion does not revalidate the completed item');
  assert.equal(ctx.progress.exerciseDrafts['09.08'], 'draft remains');
  assert.equal(ctx.progress.exerciseReflections['09.08'], 'reflection remains');
  selected = [{value: '0'}, {value: '1'}];
  assert.equal(controller.handleInput({target}, item), true);
  assert.deepEqual(JSON.parse(JSON.stringify(ctx.progress.exerciseEvidence['09.08'].rubric)), [0, 1]);
  assert.equal(renders(), 2, 'recheck updates the visible completion state');
  const recheckedHtml = controller.renderCurriculumLesson(item);
  const currentInputs = [...recheckedHtml.matchAll(/<input[^>]*data-course-rubric="09\.08"[^>]*>/g)].map(match => match[0]);
  assert(currentInputs.every(input => /\bchecked\b/.test(input)), 'current criteria remain checked after reload/render');
  assert.match(recheckedHtml, /Atividade concluída/);
});

test('legacy freeform prediction remains visible until explicit structured replacement', async () => {
  const item = {id: '04.03', stage: '04', kind: 'PREDICT', contentVersion: 1, autoTested: true, firstResponse: {action: 'Preveja os resultados.', timing: 'Antes de executar.'}, explanation: {mental_model: 'm', worked_example: 'w', common_trap: 't', why_it_matters: 'y'}, starterFiles: [{path: 'main.js', content: 'export const value = 1;'}]};
  const table = {version: 2, instructions: 'Preveja os valores.', fields: [{id: 'value', label: 'value'}]};
  const legacy = 'Minha previsão <script>antiga</script>';
  const {controller, renders, ctx} = lessonController([item], {'04.03': {environment: 'javascript', version: 1, checks: ['behavior'], predictionTable: table}}, {'04.03': legacy});
  controller.renderCurriculumLesson(item);
  await new Promise(resolve => setTimeout(resolve, 0));
  let html = controller.renderCurriculumLesson(item);
  assert.match(html, /Minha previsão &lt;script&gt;antiga&lt;\/script&gt;/, 'legacy response is escaped and retained');
  assert.match(html, /formato livre e foi preservada/);
  assert.match(html, /Criar previsão estruturada para este exercício/);
  assert.match(html, /A resposta antiga continua preservada/);
  assert.doesNotMatch(html, /data-course-run="04\.03"/, 'legacy freeform does not unlock execution for a structured prediction activity');
  assert.equal(renders(), 1);
  const target = {dataset: {guidedAction: 'prediction-edit'}, closest() { return this; }};
  assert.equal(controller.handleClick({target, preventDefault() {}}, item), true);
  html = controller.renderCurriculumLesson(item);
  assert.match(html, /Minha previsão &lt;script&gt;antiga&lt;\/script&gt;/, 'opening editor does not overwrite the legacy response');
  assert.match(html, /data-prediction-field="value"/);
  assert.equal(renders(), 2);
  ctx.progress.exercisePredictions[item.id] = JSON.stringify({version: 2, answers: {value: 'nova resposta'}});
  controller.predictionSaved(item.id);
  html = controller.renderCurriculumLesson(item);
  assert.match(html, /nova resposta/, 'explicit replacement installs the new versioned response');
  assert.doesNotMatch(html, /Minha previsão/);
  assert.match(html, /data-course-run="04\.03"/, 'a current versioned response unlocks execution');
});

test('opted-in prediction hides starter source until a compatible response without changing other IDs', async () => {
  const sourceMarker = 'export const marker = "starter-source";';
  const table = {version: 1, instructions: 'Registre sua previsão.', fields: [{id: 'crescimentos', path: '[*].crescimento'}], revealSourceAfterPrediction: true};
  const item08 = {id: '08.01', stage: '08', kind: 'PREDICT', contentVersion: 1,
    firstResponse: {action: 'Classifique os crescimentos.', timing: 'Antes de executar.'},
    preparation: {practiceSteps: ['Classifique os trechos.'], predictionGuide: 'Preveja a saída.'},
    explanation: {mental_model: 'm', worked_example: 'w', common_trap: 't', why_it_matters: 'y'},
    prompt: 'Classifique os trechos.', interaction: 'Registre uma previsão.', starterFiles: [{path: 'main.js', content: sourceMarker}]};
  const {controller, ctx} = lessonController([item08], {'08.01': {environment: 'javascript', version: 1, checks: ['behavior'], predictionTable: table}});
  ctx.progress.warmupCompleted = {'08.01': false};

  let html = controller.renderCurriculumLesson(item08);
  assert.doesNotMatch(html, /starter-source/, 'first render must not leak source while assessment metadata is loading');
  await new Promise(resolve => setTimeout(resolve, 0));
  html = controller.renderCurriculumLesson(item08);
  assert.doesNotMatch(html, /starter-source/, 'unanswered opted-in activity hides source after metadata loads');

  ctx.progress.warmupCompleted['08.01'] = true;
  ctx.progress.exercisePredictions['08.01'] = 'resposta antiga em formato livre';
  html = controller.renderCurriculumLesson(item08);
  assert.doesNotMatch(html, /starter-source/, 'an incompatible preserved response does not unlock the preview');
  assert.match(html, /resposta antiga em formato livre/, 'the learner\'s legacy response remains visible');
  ctx.progress.exercisePredictions['08.01'] = JSON.stringify({version: 0, answers: {crescimentos: 'resposta anterior'}});
  html = controller.renderCurriculumLesson(item08);
  assert.doesNotMatch(html, /starter-source/, 'a structured response from another table version also keeps the preview hidden');
  assert.match(html, /resposta anterior/, 'the incompatible structured response remains visible for explicit replacement');

  ctx.progress.exercisePredictions['08.01'] = JSON.stringify({version: 1, answers: {crescimentos: 'O(n)'}});
  html = controller.renderCurriculumLesson(item08);
  assert.match(html, /starter-source/, 'a compatible registered prediction unlocks the standard starter preview');
  assert.match(html, /data-course-editor="08\.01"/, 'the practice editor is also available after answerReady');

  const legacyWarmup = lessonController([item08], {'08.01': {environment: 'javascript', version: 1, checks: ['behavior'], predictionTable: table}}, {'08.01': 'previsão antiga em formato livre'});
  html = legacyWarmup.controller.renderCurriculumLesson(item08);
  assert.doesNotMatch(html, /starter-source|data-course-editor="08\.01"/, 'saved legacy progress cannot unlock source or editor before assessment metadata loads');
  await new Promise(resolve => setTimeout(resolve, 0));
  html = legacyWarmup.controller.renderCurriculumLesson(item08);
  assert.match(html, /previsão antiga em formato livre/, 'legacy progress remains visible after metadata arrives');
  assert.doesNotMatch(html, /starter-source|data-course-editor="08\.01"/, 'incompatible legacy progress remains gated after metadata validation');

  const structuredWarmup = lessonController([item08], {'08.01': {environment: 'javascript', version: 1, checks: ['behavior'], predictionTable: table}}, {'08.01': JSON.stringify({version: 1, answers: {crescimentos: 'O(n)'}})});
  html = structuredWarmup.controller.renderCurriculumLesson(item08);
  assert.doesNotMatch(html, /starter-source|data-course-editor="08\.01"/, 'saved structured progress also waits for assessment metadata on first paint');
  await new Promise(resolve => setTimeout(resolve, 0));
  html = structuredWarmup.controller.renderCurriculumLesson(item08);
  assert.match(html, /starter-source/, 'a saved compatible prediction unlocks the preview once metadata is verified');
  assert.match(html, /data-course-editor="08\.01"/, 'a saved compatible prediction unlocks the editor once metadata is verified');

  const item07 = {...item08, id: '07.01', stage: '07', starterFiles: [{path: 'main.js', content: sourceMarker}]};
  const other = lessonController([item07], {'07.01': {environment: 'javascript', version: 1, checks: ['behavior']}});
  other.ctx.progress.warmupCompleted = {'07.01': false};
  other.controller.renderCurriculumLesson(item07);
  await new Promise(resolve => setTimeout(resolve, 0));
  html = other.controller.renderCurriculumLesson(item07);
  assert.match(html, /starter-source/, 'an ID without the opt-in keeps its published preview behavior');
});

test('prediction table version mismatch stays visible and does not unlock execution', async () => {
  const item = {id: '04.03', stage: '04', kind: 'PREDICT', contentVersion: 1, autoTested: true, firstResponse: {action: 'Preveja os resultados.', timing: 'Antes de executar.'}, explanation: {mental_model: 'm', worked_example: 'w', common_trap: 't', why_it_matters: 'y'}, starterFiles: [{path: 'main.js', content: 'export const value = 1;'}]};
  const table = {version: 2, instructions: 'Preveja os valores.', fields: [{id: 'value', label: 'value'}]};
  const oldResponse = JSON.stringify({version: 1, answers: {value: 'resposta anterior'}});
  const {controller} = lessonController([item], {'04.03': {environment: 'javascript', version: 1, checks: ['behavior'], predictionTable: table}}, {'04.03': oldResponse});
  controller.renderCurriculumLesson(item);
  await new Promise(resolve => setTimeout(resolve, 0));
  const html = controller.renderCurriculumLesson(item);
  assert.match(html, /versão 1; este exercício agora usa a versão 2/);
  assert.match(html, /resposta anterior/);
  assert.match(html, /Criar previsão estruturada para este exercício/);
  assert.doesNotMatch(html, /data-course-run="04\.03"/);
});

test('a type-only investigation names its real entry file and the TypeScript checker, not main.js', async () => {
  const item = {id: '15.01', stage: '15', kind: 'MAKE', contentVersion: 1, firstResponse: {action: 'Escreva sua primeira resposta.', timing: 'Antes de executar.'}, explanation: {mental_model: 'm', worked_example: 'w', common_trap: 't', why_it_matters: 'y'}, autoTested: false, assessmentEnvironment: 'typescript', starterFiles: [{path: 'diagnosticos.ts', content: 'const x = 1;'}]};
  const {controller, renders} = lessonController([item], {'15.01': {environment: 'typescript', version: 1, checks: ['types'], entryPath: 'diagnosticos.ts'}});
  controller.renderCurriculumLesson(item);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(renders(), 1, 'the lesson re-renders once the published assessment arrives');
  const html = controller.renderCurriculumLesson(item);
  assert.match(html, /<code>diagnosticos\.ts<\/code>/);
  assert.doesNotMatch(html, /main\.js/);
  assert.doesNotMatch(html, /como análise escrita/);
  assert.match(html, /verificador de TypeScript roda neste site/);
  assert.match(html, /Verificar tipos/);
});

test('an autoTested activity with a JavaScript entry cites that entry file', async () => {
  const item = {id: '11.04', stage: '11', kind: 'MAKE', contentVersion: 1, firstResponse: {action: 'Escreva sua primeira resposta.', timing: 'Antes de executar.'}, explanation: {mental_model: 'm', worked_example: 'w', common_trap: 't', why_it_matters: 'y'}, autoTested: true, assessmentEnvironment: 'dom', starterFiles: [{path: 'form.js', content: ''}, {path: 'index.html', content: ''}]};
  const {controller} = lessonController([item], {'11.04': {environment: 'dom', version: 1, checks: ['behavior'], entryPath: 'form.js', testPath: '__devpath_tests__.js', tests: 'test("x", () => {});'}});
  controller.renderCurriculumLesson(item);
  await new Promise(resolve => setTimeout(resolve, 0));
  const html = controller.renderCurriculumLesson(item);
  assert.match(html, /<code>form\.js<\/code>/);
  assert.doesNotMatch(html, /main\.js/);
});

test('an executable activity without published tests does not claim it is written analysis only', () => {
  const item = {id: '04.01', stage: '04', kind: 'MAKE', contentVersion: 1, firstResponse: {action: 'Escreva sua primeira resposta.', timing: 'Antes de executar.'}, explanation: {mental_model: 'm', worked_example: 'w', common_trap: 't', why_it_matters: 'y'}, autoTested: false, assessmentEnvironment: undefined, starterFiles: [{path: 'main.js', content: ''}]};
  const {controller} = lessonController([item], {});
  const html = controller.renderCurriculumLesson(item);
  assert.doesNotMatch(html, /como análise escrita/);
  assert.match(html, /O executor roda o JavaScript/);
});

test('the curriculum build marks every behavior or mutation assessment as autoTested; type-only investigations stay rubric-completed', async () => {
  const {createCourseArtifacts} = await import('../course-src/build-public-curriculum.mjs');
  const catalog = JSON.parse(createCourseArtifacts().get('public/course-catalog.json'));
  const byId = new Map(catalog.map(item => [item.id, item]));
  // 15.01 and 15.06 keep intentional type errors as study material, so a passing typecheck cannot be their completion gate.
  for (const id of ['15.01', '15.06']) assert.notEqual(byId.get(id).autoTested, true, id);
  const assessments = JSON.parse(readFileSync('course-src/assessments.json', 'utf8'));
  const runnerChecks = ['behavior', 'mutation'];
  const unmarked = Object.entries(assessments)
    .filter(([id, assessment]) => id !== '_comment' && !['local', 'rubric'].includes(assessment.environment) && assessment.checks.some(check => runnerChecks.includes(check)))
    .filter(([id]) => byId.get(id)?.autoTested !== true)
    .map(([id]) => id);
  assert.deepEqual(unmarked, []);
});
