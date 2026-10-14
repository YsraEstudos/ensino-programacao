import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {loadTsModule} from './load-ts-module.mjs';

// B-1: "Aprender este conceito" on a demonstrated attempt must ask first. Uses the real reducer for the downgrade.
const learning = loadTsModule('lib/learning-progress.ts');
const source = readFileSync(new URL('../public/learning-paths.js', import.meta.url), 'utf8');
const item = {id: '04.04', title: 'Exemplo', stage: '04', contentVersion: 1};
const markup = '<article class="course-lesson"><a class="lesson-back">Voltar</a><header><h1>Exemplo</h1></header><section id="g-learn"><h2>Explicação</h2><p>Regra ensinada.</p></section></article>';
const flush = () => new Promise(resolve => setImmediate(resolve));
const ctx = (fingerprint, overrides = {}) => ({contentVersion: 1, assessmentVersion: 1, fingerprint, independent: true, assessmentPassed: false, mode: 'recall', ...overrides});

// Builds a genuinely demonstrated record through the reducer (attempt, then passing independent evaluation).
function demonstratedRecord() {
  const attempted = learning.transitionLearning(null,
    {id: 'a1', kind: 'attempted', attemptId: 'attempt-demo', at: '2026-10-11T10:00:00.000Z', fingerprint: 'abc', source: 'browser'}, ctx('abc'));
  const demonstrated = learning.transitionLearning(attempted,
    {id: 'd1', kind: 'demonstrated', attemptId: 'attempt-demo', at: '2026-10-11T10:05:00.000Z', fingerprint: 'abc', source: 'browser'}, ctx('abc', {assessmentPassed: true}));
  assert.equal(demonstrated.state, 'demonstrated', 'fixture is a demonstrated attempt');
  return demonstrated;
}

function setup({confirmAnswer}) {
  const dom = new JSDOM('<div id="host"></div>', {runScripts: 'outside-only', url: 'https://devpath.test/'});
  dom.window.eval(source);
  const api = dom.window.DevPathLearningPaths;
  const state = {record: demonstratedRecord(), calls: [], questions: []};
  // Stands in for app.js startLearning: applies the real reducer exactly as the app would.
  const learningBridge = {
    record: () => state.record,
    startLearning: async (_item, mode) => {
      state.calls.push(mode);
      const at = new Date(Date.parse(state.record.currentUpdatedAt) + 1000).toISOString();
      state.record = learning.transitionLearning(state.record,
        {id: `s-${state.calls.length}`, kind: 'studied', attemptId: state.record.attemptId, at, fingerprint: 'abc', source: 'rubric-declared'},
        ctx('abc', {mode, independent: state.record.attemptIndependent}));
    }
  };
  const context = {progress: {exerciseLearning: {[item.id]: state.record}}, assessments: {}, learning: learningBridge, render() {}, confirm: message => { state.questions.push(message); return confirmAnswer; }};
  const root = dom.window.document.createElement('div');
  root.innerHTML = api.decorate(item, markup, context);
  const click = selector => api.handleClick({target: root.querySelector(selector), preventDefault() {}}, item, context, root);
  return {dom, api, state, context, root, click};
}

test('declining the learn-first choice on a demonstrated attempt sends nothing and keeps the demonstration', async () => {
  const {dom, state, click} = setup({confirmAnswer: false});
  const before = JSON.stringify(state.record);
  await click('button[data-learning-mode="learn"]');
  await flush();
  assert.equal(state.questions.length, 1, 'the learner is asked first');
  assert.match(state.questions[0], /Estudar de novo agora/);
  assert.deepEqual(state.calls, [], 'no study event is sent when declined');
  assert.equal(JSON.stringify(state.record), before, 'the record is unchanged');
  assert.equal(state.record.state, 'demonstrated', 'the demonstration is kept');
  dom.window.close();
});

test('confirming the learn-first choice on a demonstrated attempt applies the downgrade the warning describes', async () => {
  const {dom, state, click} = setup({confirmAnswer: true});
  await click('button[data-learning-mode="learn"]');
  await flush();
  assert.deepEqual(state.calls, ['learn']);
  assert.equal(state.record.assisted, true, 'studying again marks the attempt assisted');
  assert.equal(state.record.state, 'verified', 'the demonstration is downgraded to verified, as warned');
  dom.window.close();
});
