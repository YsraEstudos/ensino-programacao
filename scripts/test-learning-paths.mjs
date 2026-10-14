import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/learning-paths.js', import.meta.url), 'utf8');

function load() {
  const dom = new JSDOM('<div id="host"></div>', {runScripts: 'outside-only', url: 'https://devpath.test/'});
  dom.window.eval(source);
  return {dom, api: dom.window.DevPathLearningPaths};
}

const item = {id: '04.04', title: 'Exemplo', stage: '04', contentVersion: 1};
const markup = '<article class="course-lesson"><a class="lesson-back">Voltar</a><header><h1>Exemplo</h1></header><section id="g-learn"><h2>Explicação</h2><p>Regra ensinada.</p></section><section class="course-explanation-panel"><h2>Outra explicação</h2></section><section data-course-challenge><h2>Desafio</h2><textarea data-answer></textarea><button type="button" data-course-run>Executar</button></section><details><summary>Exemplo resolvido</summary><pre>console.log(1)</pre></details></article>';

test('all activity markup begins behind the learn/recall choice and preserves the original controls', () => {
  const {dom, api} = load();
  const html = api.decorate(item, markup, {progress: {exerciseLearning: {}}, assessments: {}});
  const view = dom.window.document.createElement('div');
  view.innerHTML = html;
  const gate = view.querySelector('[data-learning-gate]');
  assert(gate, 'a gate is injected for a generic activity');
  assert.match(gate.textContent, /Aprender este conceito/);
  assert.match(gate.textContent, /Tentar de memória/);
  assert(gate.compareDocumentPosition(view.querySelector('#g-learn')) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING);
  assert.equal(view.querySelector('#g-learn').hidden, true);
  assert.equal(view.querySelector('[data-answer]').hidden, true);
  assert(view.querySelector('[data-answer]'), 'the challenge control is retained behind the initial choice');
  dom.window.close();
});

test('recall opens the challenge while hiding examples and offers explicit, unit-scoped help', () => {
  const {dom, api} = load();
  const record = {mode: 'recall', state: 'attempted', attemptId: 'attempt-1', attemptIndependent: true, assisted: false, currentFingerprint: 'abc', currentUpdatedAt: '2026-10-11T10:00:00.000Z', contentVersion: 1, assessmentVersion: 1, events: []};
  const html = api.decorate(item, markup, {progress: {exerciseLearning: {'04.04': record}}, assessments: {}});
  const view = dom.window.document.createElement('div');
  view.innerHTML = html;
  assert.equal(view.querySelector('[data-course-challenge]').hidden, false);
  assert.equal(view.querySelector('#g-learn').hidden, true);
  assert.equal(view.querySelector('details').hidden, true);
  assert(view.querySelector('[data-learning-help-target]'), 'hidden teaching has an explicit help affordance');
  dom.window.close();
});

test('recall hides Stage 00 worked examples and environment demonstrations but keeps lab challenges available', () => {
  const {dom, api} = load();
  const stageMarkup = `<article class="course-lesson">
    <section class="s00-lab" data-s00-lab="message-action"><h2>Mensagem</h2><div class="s00-argument-preview"><p>Valores antes da chamada</p></div><pre data-s00-lab-code>console.log()</pre><pre data-s00-lab-output>Resultado: pronto</pre><button data-s00-lab-choice="0">Resposta</button></section>
    <section class="s00-lab" data-s00-lab="environment-bridge"><h2>Ambientes</h2><button data-s00-lab-choice="0">Tarefa</button><div class="s00-environment-demos"><h3>Console · demonstração</h3><pre>saida()</pre></div><p class="s00-lab-note">Resumo da demonstração</p></section>
    <section class="s00-lab" data-s00-lab="trace"><h2>Rastreio</h2><h3>O que acontece?</h3><button data-s00-lab-choice="0">Desafio</button></section>
  </article>`;
  const record = {mode:'recall',state:'attempted',attemptId:'attempt-stage00',attemptIndependent:true,assisted:false,currentFingerprint:'abc',contentVersion:1,assessmentVersion:1,events:[]};
  const root = dom.window.document.createElement('div');
  root.innerHTML = api.decorate({id:'00.04'}, stageMarkup, {progress:{exerciseLearning:{'00.04':record}},assessments:{}});
  assert.equal(root.querySelector('[data-s00-lab="message-action"]').hidden,false,'the recall lab remains available');
  assert.equal(root.querySelector('.s00-argument-preview').hidden,true,'the worked argument example is hidden before help');
  assert.equal(root.querySelector('[data-s00-lab="message-action"] [data-s00-lab-code]').hidden,true,'the authored answer code is hidden before help');
  assert.equal(root.querySelector('[data-s00-lab="message-action"] [data-s00-lab-output]').hidden,true,'the authored output is hidden before help');
  assert.equal(root.querySelector('.s00-environment-demos').hidden,true,'embedded environment demonstrations are hidden');
  assert.equal(root.querySelector('.s00-lab-note').hidden,true,'the paired demonstration note is hidden');
  assert.equal(root.querySelector('[data-s00-lab="environment-bridge"] [data-s00-lab-choice]').hidden,false,'the independent task remains available');
  assert.equal(root.querySelector('[data-s00-lab="trace"] [data-s00-lab-choice]').hidden,false,'the recall challenge remains available');
  assert(root.querySelectorAll('[data-learning-help-target]').length >= 3,'each hidden worked unit has an explicit help affordance');
  dom.window.close();
});

test('adapter controls are not mistaken for the path button, and requested help stays unit-scoped in the current session', async () => {
  const {dom, api} = load();
  const record = {mode:'recall',state:'attempted',attemptId:'attempt-help-scope',attemptIndependent:true,assisted:false,currentFingerprint:'abc',currentUpdatedAt:'2026-10-11T10:00:00.000Z',contentVersion:1,assessmentVersion:1,events:[]};
  const context = {progress:{exerciseLearning:{[item.id]:record}},assessments:{},learning:{requestHelp:async()=>{record.assisted=true;}},render(){}};
  const root = dom.window.document.createElement('div');
  root.innerHTML = api.decorate(item, markup, context);
  const run = root.querySelector('[data-course-run]');
  assert.equal(api.handleClick({target:run,preventDefault(){}},item,context,root),false,'normal adapter action reaches its owner');
  const help = root.querySelector('[data-learning-help-target="g-learn"]');
  assert(help);
  await api.handleClick({target:help,preventDefault(){}},item,context,root);
  root.innerHTML = api.decorate(item, markup, context);
  assert.equal(root.querySelector('#g-learn').hidden,false);
  assert.equal(root.querySelector('.course-explanation-panel').hidden,true,'unrequested teaching stays closed');
  assert.equal(root.querySelector('[data-course-challenge]').hidden,false);
  dom.window.close();
});

test('demonstration UI is absent without a declared transfer and uses only the transfer rubric when present', () => {
  const {dom, api} = load();
  const root = dom.window.document.createElement('div');
  root.innerHTML = api.decorate(item, markup, {progress: {exerciseLearning: {}}, assessments: {}});
  assert.equal(root.querySelector('[data-learning-transfer]'), null);
  root.innerHTML = api.decorate(item, markup, {progress: {exerciseLearning: {}}, assessments: { '04.04': {version: 2, transfer: {id: '04.04-independent', files: [{path: 'transfer.md', content: 'Use outra regra em outro contexto.'}], rubric: ['Resposta aplica a regra em outro caso.']} } }});
  assert(root.querySelector('[data-learning-transfer]'));
  assert.match(root.querySelector('[data-learning-transfer]').textContent, /Rubrica declarada/);
  assert.equal(root.querySelectorAll('[data-learning-transfer-rubric]').length, 1);
  dom.window.close();
});

test('historical mastery remains visible while the current attempt is pending', () => {
  const {dom, api} = load();
  const record = {mode:'recall',state:'attempted',attemptId:'attempt-new',attemptIndependent:true,assisted:false,currentFingerprint:'new',currentUpdatedAt:'2026-10-11T10:00:00.000Z',contentVersion:1,assessmentVersion:1,verifiedEvidence:{attemptId:'attempt-old',contentVersion:1,assessmentVersion:1,fingerprint:'old',source:'browser',at:'2026-10-10T10:00:00.000Z'},demonstratedEvidence:{attemptId:'attempt-old',contentVersion:1,assessmentVersion:1,fingerprint:'old',source:'rubric-declared',at:'2026-10-10T10:00:00.000Z'},events:[]};
  const root = dom.window.document.createElement('div');
  root.innerHTML = api.decorate(item, markup, {progress:{exerciseLearning:{[item.id]:record}},assessments:{}});
  assert.match(root.querySelector('[data-learning-evidence]').textContent,/Estado histórico: Demonstrada/);
  assert.match(root.querySelector('[data-learning-evidence]').textContent,/pendente ou desatualizada/);
  assert.match(root.querySelector('[data-learning-evidence]').textContent,/Evidência histórica: Rubrica declarada/);
  assert.match(root.querySelector('[data-learning-evidence]').textContent,/Origem da evidência atual: Aguardando avaliação/);
  assert.doesNotMatch(root.querySelector('[data-learning-evidence]').textContent,/Origem da evidência atual: Rubrica declarada/);
  dom.window.close();
});

test('mode, help, assessment and transfer actions go through the injected learning bridge', async () => {
  const {dom, api} = load();
  const calls = [];
  const context = {
    progress: {exerciseLearning: {}}, assessments: {'04.04': {version: 1, transfer: {id: 'transfer-1', files: [{path: 'transfer.md', content: 'Caso diferente.'}], rubric: ['Aplica a regra ao novo caso.']}}},
    learning: {
      startLearning: (...args) => { calls.push(['start', ...args]); },
      requestHelp: (...args) => { calls.push(['help', ...args]); },
      runTransfer: (...args) => { calls.push(['transfer', ...args]); },
      runAssessment: (...args) => { calls.push(['assessment', ...args]); }
    },
    render() { calls.push(['render']); }
  };
  const root = dom.window.document.createElement('div');
  root.innerHTML = api.decorate(item, markup, context);
  const click = selector => api.handleClick({target: root.querySelector(selector)}, item, context, root);
  await click('[data-learning-mode="recall"]');
  assert.equal(calls[0][0], 'start');
  context.progress.exerciseLearning[item.id] = {mode:'recall',state:'attempted',attemptId:'attempt-test',attemptIndependent:true,assisted:false,currentFingerprint:'abc',currentUpdatedAt:'2026-10-11T10:00:00.000Z',contentVersion:1,assessmentVersion:1,events:[]};
  root.innerHTML = api.decorate(item, markup, context);
  const nextClick = selector => api.handleClick({target:root.querySelector(selector)}, item, context, root);
  await nextClick('[data-learning-help-target]');
  assert.equal(calls.find(call => call[0] === 'help')?.length > 1, true);
  root.querySelector('[data-learning-transfer-response]').value = 'Uma regra aplicada a outro caso concreto.';
  root.querySelector('[data-learning-transfer-rubric]').checked = true;
  await nextClick('[data-learning-transfer-submit]');
  assert.equal(calls.find(call => call[0] === 'transfer')?.length > 1, true, JSON.stringify(calls));
  dom.window.close();
});

test('the activity header shows the progress-model state as text, from the learning record only', () => {
  const {dom, api} = load();
  const badgeText = record => {
    const root = dom.window.document.createElement('div');
    root.innerHTML = api.decorate(item, markup, {progress: {exerciseLearning: record ? {[item.id]: record} : {}}, assessments: {}});
    return root.querySelector('[data-learning-state-row]').textContent.replace(/\s+/g, ' ').trim();
  };
  const base = {mode: 'learn', attemptId: 'attempt-badge', attemptIndependent: false, assisted: true, currentFingerprint: 'abc', currentUpdatedAt: '2026-10-11T10:00:00.000Z', contentVersion: 1, assessmentVersion: 1, events: []};
  assert.match(badgeText(null), /Estado desta atividade: Ainda não iniciada/);
  assert.match(badgeText({...base, state: 'attempted'}), /Tentativa$/);
  assert.match(badgeText({...base, state: 'studied'}), /Estudada$/);
  assert.match(badgeText({...base, state: 'verified', verifiedEvidence: {attemptId: 'attempt-badge', contentVersion: 1, assessmentVersion: 1, fingerprint: 'abc', source: 'browser', at: '2026-10-11T10:00:00.000Z'}}), /Verificada$/);
  assert.match(badgeText({...base, state: 'verified', verifiedEvidence: {attemptId: 'attempt-badge', contentVersion: 1, assessmentVersion: 1, fingerprint: 'abc', source: 'browser', at: '2026-10-11T10:00:00.000Z'}, demonstratedEvidence: {attemptId: 'attempt-badge', contentVersion: 1, assessmentVersion: 1, fingerprint: 'abc', source: 'rubric-declared', at: '2026-10-11T10:00:00.000Z'}}), /Demonstrada$/);
  dom.window.close();
});

test('the learn-first and recall choices are announced by pressed state and keep their text labels', () => {
  const {dom, api} = load();
  const root = dom.window.document.createElement('div');
  root.innerHTML = api.decorate(item, markup, {progress: {exerciseLearning: {[item.id]: {mode: 'learn', state: 'studied', attemptId: 'a1', attemptIndependent: false, assisted: true, currentFingerprint: 'abc', currentUpdatedAt: '2026-10-11T10:00:00.000Z', contentVersion: 1, assessmentVersion: 1, events: []}}}, assessments: {}});
  assert.equal(root.querySelector('button[data-learning-mode="learn"]').getAttribute('aria-pressed'), 'true');
  assert.equal(root.querySelector('button[data-learning-mode="recall"]').getAttribute('aria-pressed'), 'false');
  assert.equal(root.querySelector('button[data-learning-mode="learn"]').textContent, 'Aprender este conceito');
  dom.window.close();
});
