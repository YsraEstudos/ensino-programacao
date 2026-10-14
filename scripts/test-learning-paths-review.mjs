import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

// Review-round behaviour for public/learning-paths.js: evaluation reveal, help confirmation, focus, ARIA and failure status.
const source = readFileSync(new URL('../public/learning-paths.js', import.meta.url), 'utf8');

function load() {
  const dom = new JSDOM('<div id="host"></div>', {runScripts: 'outside-only', url: 'https://devpath.test/'});
  dom.window.eval(source);
  return {dom, api: dom.window.DevPathLearningPaths};
}

const item = {id: '04.04', title: 'Exemplo', stage: '04', contentVersion: 1};
const markup = '<article class="course-lesson"><a class="lesson-back">Voltar</a><header><h1>Exemplo</h1></header><section id="g-learn"><h2>Explicação</h2><p>Regra ensinada.</p></section><section class="course-explanation-panel"><h2>Outra explicação</h2></section><section data-course-challenge><h2>Desafio</h2><textarea data-answer></textarea><button type="button" data-course-run>Executar</button></section><details><summary>Exemplo resolvido</summary><pre>console.log(1)</pre></details></article>';
const flush = () => new Promise(resolve => setImmediate(resolve));
const recallRecord = (extra = {}) => ({mode: 'recall', state: 'attempted', attemptId: 'attempt-review', attemptIndependent: true, assisted: false, currentFingerprint: 'abc', currentUpdatedAt: '2026-10-11T10:00:00.000Z', contentVersion: 1, assessmentVersion: 1, events: [], ...extra});
const evidence = source => ({attemptId: 'attempt-review', contentVersion: 1, assessmentVersion: 1, fingerprint: 'abc', source, at: '2026-10-11T10:05:00.000Z'});

test('after the attempt is evaluated, explanations open without recording help', () => {
  const {dom, api} = load();
  const evaluated = recallRecord({verifiedEvidence: evidence('browser')});
  const root = dom.window.document.createElement('div');
  root.innerHTML = api.decorate(item, markup, {progress: {exerciseLearning: {[item.id]: evaluated}}, assessments: {}});
  assert.equal(root.querySelector('#g-learn').hidden, false, 'the explanation opens after evaluation');
  assert.equal(root.querySelector('details').hidden, false, 'worked examples open after evaluation');
  assert.equal(evaluated.assisted, false, 'opening after evaluation does not mark the attempt as assisted');
  dom.window.close();
});

test('before any submission, recall keeps the explanation closed', () => {
  const {dom, api} = load();
  const root = dom.window.document.createElement('div');
  root.innerHTML = api.decorate(item, markup, {progress: {exerciseLearning: {[item.id]: recallRecord()}}, assessments: {}});
  assert.equal(root.querySelector('#g-learn').hidden, true);
  dom.window.close();
});

test('help after demonstration asks first, and declining leaves the attempt untouched', async () => {
  const {dom, api} = load();
  const demonstrated = recallRecord({state: 'demonstrated', demonstratedEvidence: {...evidence('rubric-declared')}});
  const requests = [], questions = [];
  const context = {progress: {exerciseLearning: {[item.id]: demonstrated}}, assessments: {}, learning: {requestHelp: async (...args) => { requests.push(args); }, record: () => demonstrated}, render() {}, confirm: message => { questions.push(message); return false; }};
  const root = dom.window.document.createElement('div');
  root.innerHTML = api.decorate(item, markup, context);
  const hint = dom.window.document.createElement('button'); hint.dataset.guidedAction = 'hint'; root.append(hint);
  await api.handleClick({target: hint, preventDefault() {}}, item, context, root);
  await flush();
  assert.equal(questions.length, 1, 'the learner is asked before the demonstration is downgraded');
  assert.match(questions[0], /deixa de contar/);
  assert.equal(requests.length, 0, 'declining sends no help request');
  dom.window.close();
});

test('confirming help after demonstration sends the request', async () => {
  const {dom, api} = load();
  const demonstrated = recallRecord({state: 'demonstrated', demonstratedEvidence: {...evidence('rubric-declared')}});
  const requests = [];
  const context = {progress: {exerciseLearning: {[item.id]: demonstrated}}, assessments: {}, learning: {requestHelp: async (...args) => { requests.push(args); }, record: () => demonstrated}, render() {}, confirm: () => true};
  const root = dom.window.document.createElement('div');
  root.innerHTML = api.decorate(item, markup, context);
  const hint = dom.window.document.createElement('button'); hint.dataset.guidedAction = 'hint'; root.append(hint);
  await api.handleClick({target: hint, preventDefault() {}}, item, context, root);
  await flush();
  assert.equal(requests.length, 1);
  dom.window.close();
});

test('help keeps keyboard focus on the revealed explanation and announces it', async () => {
  const {dom, api} = load();
  const record = recallRecord();
  const messages = [];
  let root;
  const context = {progress: {exerciseLearning: {[item.id]: record}}, assessments: {}, learning: {requestHelp: async () => { record.assisted = true; }, record: () => record}, render() { root.innerHTML = api.decorate(item, markup, context); }, toast: message => messages.push(message)};
  root = dom.window.document.createElement('div');
  dom.window.document.body.appendChild(root);
  root.innerHTML = api.decorate(item, markup, context);
  const help = root.querySelector('[data-learning-help-target="g-learn"]');
  help.focus();
  await api.handleClick({target: help, preventDefault() {}}, item, context, root);
  await flush();
  assert.equal(dom.window.document.activeElement.id, 'g-learn', 'focus moves to the revealed explanation, not to the body');
  assert.deepEqual(messages, ['Ajuda revelada nesta atividade.']);
  dom.window.close();
});

test('help buttons expose the unit they control', () => {
  const {dom, api} = load();
  const root = dom.window.document.createElement('div');
  root.innerHTML = api.decorate(item, markup, {progress: {exerciseLearning: {[item.id]: recallRecord()}}, assessments: {}});
  const help = root.querySelector('[data-learning-help-target="g-learn"]');
  assert.equal(help.getAttribute('aria-expanded'), 'false');
  assert.equal(help.getAttribute('aria-controls'), root.querySelector('#g-learn').id);
  dom.window.close();
});

test('a failed transfer submission reports the failure in the transfer status', async () => {
  const {dom, api} = load();
  const assessments = {[item.id]: {version: 1, transfer: {id: 't-1', files: [{path: 'transfer.md', content: 'Caso novo.'}], rubric: ['Aplica a regra.']}}};
  const evaluated = recallRecord({verifiedEvidence: evidence('browser')});
  const context = {progress: {exerciseLearning: {[item.id]: evaluated}}, assessments, learning: {runTransfer: () => Promise.reject(new Error('down'))}, render() {}};
  const root = dom.window.document.createElement('div');
  root.innerHTML = api.decorate(item, markup, context);
  root.querySelector('[data-learning-transfer-response]').value = 'Uma regra aplicada a outro caso concreto.';
  root.querySelector('[data-learning-transfer-rubric]').checked = true;
  await api.handleClick({target: root.querySelector('[data-learning-transfer-submit]'), preventDefault() {}}, item, context, root);
  await flush();
  assert.match(root.querySelector('[data-learning-transfer-status]').textContent, /Não foi possível registrar esta transferência agora/);
  dom.window.close();
});

test('an edit after study keeps the earlier study visible as history', () => {
  const {dom, api} = load();
  const edited = recallRecord({mode: 'learn', attemptIndependent: false, state: 'attempted', events: [{id: 'e1', kind: 'studied', attemptId: 'attempt-review', at: '2026-10-11T10:01:00.000Z', fingerprint: 'old', source: 'rubric-declared'}]});
  const root = dom.window.document.createElement('div');
  root.innerHTML = api.decorate(item, markup, {progress: {exerciseLearning: {[item.id]: edited}}, assessments: {}});
  const row = root.querySelector('[data-learning-state-row]').textContent.replace(/\s+/g, ' ');
  assert.match(row, /Tentativa/);
  assert.match(row, /Estudada antes desta edição \(histórico\)/);
  dom.window.close();
});
