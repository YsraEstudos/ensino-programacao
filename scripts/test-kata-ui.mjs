// UI tests for the kata route (#/katas), the review opt-in and the shared review renderers (Fase 6.2 and 6.3).
// Loads devpath.html in jsdom the same way the stage UI tests do, with a stubbed bank so the cases are fixed.
import {withPublicDependencies} from './public-test-source.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {JSDOM} from 'jsdom';

const root = new URL('../public/', import.meta.url);
const catalog = JSON.parse(readFileSync(new URL('course-catalog.json', root), 'utf8'));
const assessments = JSON.parse(readFileSync(new URL('course-assessments.json', root), 'utf8'));
const settle = async () => { for (let i = 0; i < 12; i += 1) await new Promise(resolve => setImmediate(resolve)); };

// Generic (non-stage-adapter) core activities: completion is a plain answers flag, so the tests control studied state.
const genericCore = catalog.filter(item => !item.optional && !/^(D|0[0-3])\./.test(item.id)).map(item => item.id);
const [PRE, OTHER, SRC_A, SRC_B] = genericCore.slice(0, 4);
const OPTIONAL = '05.16';
const versionOf = id => Number(catalog.find(item => item.id === id)?.contentVersion || 1);
const done = ids => ({
  answers: Object.fromEntries(ids.map(id => [id, true])),
  exerciseVersions: Object.fromEntries(ids.map(id => [id, versionOf(id)]))
});

function choice(sourceActivityId, slug, concept, prerequisites, bands, extra = {}) {
  return {
    variantId: `var.${sourceActivityId}.${slug}`, conceptId: concept, sourceActivityId, prerequisites, bands,
    format: 'choice-predict', environment: 'javascript', evaluator: 'choice', transferDecision: 'decisão',
    contentVersion: 1, prompt: `Pergunta de transferência ${slug}: qual resultado aparece?`,
    choices: ['primeira opção', 'segunda opção', 'terceira opção'], answer: 2,
    feedback: {correct: `Certo em ${slug}.`, byChoice: {'0': 'Não nesta.', '1': 'Não nesta também.'}},
    ...extra
  };
}

// Two concepts, all prerequisites on PRE, plus one variant blocked by OTHER (never studied in these tests).
const BANK = [
  choice(SRC_A, 'a1', 'conceito.a', [PRE], ['07', '11']),
  choice(SRC_A, 'a2', 'conceito.a', [PRE], ['07', '11']),
  choice(SRC_A, 'a3', 'conceito.a', [PRE], ['07']),
  choice(SRC_B, 'b1', 'conceito.b', [PRE], ['07']),
  choice(SRC_B, 'b2', 'conceito.b', [PRE], ['07']),
  choice(SRC_B, 'blocked', 'conceito.c', [OTHER], ['14'])
];

async function load({hash = '#/home', saved = {}, bank = BANK, bankOk = true} = {}) {
  const dom = new JSDOM(readFileSync(new URL('devpath.html', root), 'utf8'), {
    url: `http://localhost/devpath.html${hash}`, runScripts: 'outside-only'
  });
  const w = dom.window;
  const requests = [];
  w.fetch = async url => {
    const path = String(url);
    requests.push(path);
    if (path === '/course-catalog.json') return {ok: true, json: async () => catalog};
    if (path === '/course-assessments.json') return {ok: true, json: async () => assessments};
    if (path.endsWith('course-variants.json')) return bankOk ? {ok: true, json: async () => ({version: 1, variants: bank})} : {ok: false, json: async () => null};
    return {ok: false, json: async () => null};
  };
  w.localStorage.setItem('devpath-local-preview-v1', JSON.stringify(saved));
  for (const name of [...w.document.querySelectorAll('script[src]')].map(script => new URL(script.src).pathname.slice(1))) {
    w.eval(withPublicDependencies(readFileSync(new URL(name, root), 'utf8')));
  }
  await settle();
  const go = async nextHash => { w.location.hash = nextHash; await settle(); };
  const saved_ = () => JSON.parse(w.localStorage.getItem('devpath-local-preview-v1') || '{}');
  return {dom, w, doc: w.document, requests, go, progress: saved_};
}

const variantRequests = requests => requests.filter(path => path.endsWith('course-variants.json')).length;

test('the kata route is the only one that requests the variant bank on first visit', async () => {
  const env = await load({hash: '#/home'});
  try {
    await env.go('#/catalog');
    await env.go('#/javascript');
    assert.equal(variantRequests(env.requests), 0, 'home, catalog and the JavaScript overview make no bank request');
    await env.go('#/katas');
    assert.equal(variantRequests(env.requests), 1, '#/katas loads the bank once');
    await env.go('#/katas/07');
    assert.equal(variantRequests(env.requests), 1, 'the cache is shared, not fetched again');
  } finally { env.dom.window.close(); }
});

test('a blocked band shows the selector reason and an unblocked band opens a session', async () => {
  const blocked = await load({hash: '#/katas'});
  try {
    const text = blocked.doc.querySelector('#view').textContent;
    assert.match(text, /Bloqueada\./, 'no studied prerequisites: bands are blocked');
    assert.match(text, /pré-requisitos estudados/, 'the reason comes from the selector');
    assert.equal(blocked.doc.querySelectorAll('.kata-band.is-available').length, 0);
  } finally { blocked.dom.window.close(); }

  const open = await load({hash: '#/katas', saved: done([PRE, SRC_A, SRC_B])});
  try {
    // Bands 07 and 11 have eligible katas once PRE is studied; band 14 needs OTHER, and band 18 has no katas at all.
    assert.deepEqual([...open.doc.querySelectorAll('.kata-band.is-available h2')].map(node => node.textContent), ['Faixa 07', 'Faixa 11']);
    assert.deepEqual([...open.doc.querySelectorAll('.kata-band.is-blocked h2')].map(node => node.textContent), ['Faixa 14', 'Faixa 18']);
    assert.match(open.doc.querySelector('.kata-band.is-blocked').textContent, /Bloqueada/);
  } finally { open.dom.window.close(); }
});

test('an empty bank says no katas are published instead of a generic error', async () => {
  const env = await load({hash: '#/katas', bankOk: false, saved: done([PRE, SRC_A, SRC_B])});
  try {
    assert.match(env.doc.querySelector('#view').textContent, /Ainda não há katas publicadas/);
  } finally { env.dom.window.close(); }
});

test('a session mixes concepts, shows one item at a time and reports the mix', async () => {
  const env = await load({hash: '#/katas/07', saved: done([PRE, SRC_A, SRC_B])});
  try {
    const eyebrow = env.doc.querySelector('.kata-question .eyebrow').textContent;
    assert.match(eyebrow, /KATA 1 DE 5/, 'the session takes up to five katas from the eligible pool');
    assert.equal(env.doc.querySelectorAll('.kata-question').length, 1, 'one item on screen at a time');
    assert.match(env.doc.querySelector('.page-intro').textContent, /intercala 2 conceitos/);
    const prompt = env.doc.querySelector('#kata-prompt').textContent.trim();
    assert.ok(BANK.some(variant => variant.prompt === prompt), 'the prompt comes from the bank');
    assert.ok(!BANK.find(variant => variant.prompt === prompt).variantId.includes('blocked'), 'blocked katas never appear');
  } finally { env.dom.window.close(); }
});

test('a choice-predict kata with code shows the code it asks about', async () => {
  const bank = BANK.map(variant => ({...variant, code: `console.log('${variant.variantId}');
`}));
  const env = await load({hash: '#/katas/07', bank, saved: done([PRE, SRC_A, SRC_B])});
  try {
    const prompt = env.doc.querySelector('#kata-prompt').textContent.trim();
    const shown = bank.find(variant => variant.prompt === prompt);
    assert.equal(env.doc.querySelector('.kata-question pre.review-code code')?.textContent, shown.code);
  } finally { env.dom.window.close(); }
});

test('checking a kata records an attempt without moving the schedule or granting demonstrated', async () => {
  const env = await load({hash: '#/katas/07', saved: done([PRE, SRC_A, SRC_B])});
  try {
    const prompt = env.doc.querySelector('#kata-prompt').textContent.trim();
    const variant = BANK.find(item => item.prompt === prompt);
    // The app's own migration may write learning records on load; the check itself must leave them as they were.
    const learningBefore = JSON.stringify(env.progress().exerciseLearning ?? {});
    const feedback = env.doc.querySelector('#kata-feedback');
    assert.equal(feedback.getAttribute('role'), 'status');
    assert.equal(feedback.getAttribute('aria-live'), 'polite');
    assert.equal(env.doc.querySelector('[data-kata-check]').tagName, 'BUTTON');

    env.doc.querySelector(`[data-review-choice="${variant.answer}"]`).click();
    env.doc.querySelector('[data-kata-check]').click();
    await settle();

    assert.equal(env.doc.querySelector('#kata-feedback').textContent, variant.feedback.correct);
    assert.equal(env.doc.querySelector('[data-kata-advance]').hidden, false, 'advance appears after a check');
    const stored = env.progress();
    const key = `var.${variant.sourceActivityId}.kata-${variant.variantId.split('.').slice(3).join('.')}`;
    assert.equal(stored.reviewAttempts[key].status, 'passed');
    assert.ok(stored.reviewAttempts[key].finishedAt > 0);
    assert.deepEqual(stored.reviewSchedule ?? {}, {}, 'katas never write the review schedule');
    assert.equal(stored.lastReview ?? null, null);
    assert.equal(JSON.stringify(stored).includes('demonstrated'), false, 'katas never grant demonstrated');
    assert.equal(JSON.stringify(stored.exerciseLearning ?? {}), learningBefore, 'learning records are untouched by a kata check');
  } finally { env.dom.window.close(); }
});

test('kata attempts never resume or archive review attempts for the same activity', async () => {
  const env = await load({hash: '#/katas/07', saved: done([PRE, SRC_A, SRC_B])});
  try {
    const prompt = env.doc.querySelector('#kata-prompt').textContent.trim();
    const variant = BANK.find(item => item.prompt === prompt);
    env.doc.querySelector(`[data-review-choice="0"]`).click();
    env.doc.querySelector('[data-kata-check]').click();
    await settle();
    const stored = env.progress().reviewAttempts;
    assert.ok(Object.keys(stored).every(key => key.includes('.kata-')), 'only kata keys were written');
    assert.ok(!Object.keys(stored).some(key => key === variant.variantId || key.includes('@v')));
  } finally { env.dom.window.close(); }
});

test('the opt-in checkbox saves reviewOptIn, changes only the review pool, and never changes core progress counts', async () => {
  const env = await load({hash: `#/javascript/${OPTIONAL}`, saved: done([OPTIONAL])});
  try {
    const box = env.doc.querySelector('[data-review-opt-in]');
    assert.ok(box, 'a completed optional activity offers the control');
    assert.equal(box.type, 'checkbox');
    assert.equal(box.checked, false);
    assert.match(env.doc.querySelector('label.review-optin-control').textContent, /Incluir atividades opcionais concluídas nas minhas revisões/);
    const homeCountBefore = (await countsOnHome(env));

    await env.go('#/review');
    assert.ok(!env.doc.querySelector('.review-question .eyebrow')?.textContent.includes(OPTIONAL), 'without opt-in the optional activity is not reviewed');

    await env.go(`#/javascript/${OPTIONAL}`);
    const again = env.doc.querySelector('[data-review-opt-in]');
    again.checked = true;
    again.dispatchEvent(new env.w.Event('change', {bubbles: true}));
    await settle();
    assert.equal(env.progress().reviewOptIn, true, 'the choice is stored');
    assert.match(env.doc.querySelector('[data-review-opt-in-status]').textContent, /entram nas revisões/);

    await env.go('#/review');
    assert.ok(env.doc.querySelector('.review-question .eyebrow')?.textContent.includes(OPTIONAL), 'with opt-in the activity enters the review');

    await env.go('#/home');
    assert.equal(await countsOnHome(env), homeCountBefore, 'the core counts do not move with the opt-in');
  } finally { env.dom.window.close(); }
});

async function countsOnHome(env) {
  await env.go('#/home');
  return env.doc.querySelector('.stat-copy strong')?.textContent.trim();
}

test('an opted-in learner still gets kata sessions, and nothing is marked demonstrated', async () => {
  const env = await load({hash: '#/katas/07', saved: {...done([PRE, SRC_A, SRC_B]), reviewOptIn: true}});
  try {
    assert.ok(env.doc.querySelector('.kata-question'), 'an opted-in learner still gets sessions');
    const stored = env.progress();
    assert.equal(JSON.stringify(stored).includes('demonstrated'), false);
  } finally { env.dom.window.close(); }
});

test('the review still renders and grades a variant card through the shared answer renderer', async () => {
  // reviewIndex 1 picks the second studied activity in catalog order, which is the one with variants.
  const env = await load({hash: '#/review', saved: {...done([PRE, SRC_A]), reviewIndex: 1}});
  try {
    const eyebrow = env.doc.querySelector('.review-question .eyebrow')?.textContent ?? '';
    assert.match(eyebrow, /PREVISÃO/, 'a variant card, not the legacy card, is shown');
    const prompt = env.doc.querySelector('.review-question h2').textContent.trim();
    const variant = BANK.find(item => item.prompt === prompt);
    assert.ok(variant && variant.sourceActivityId === SRC_A, 'the review draws a variant for the studied activity');
    assert.equal(env.doc.querySelectorAll('.review-question [data-review-choice]').length, variant.choices.length);

    env.doc.querySelector(`[data-review-choice="${variant.answer}"]`).click();
    env.doc.querySelector('[data-review-check="variant"]').click();
    await settle();
    assert.equal(env.doc.querySelector('#review-feedback').textContent, variant.feedback.correct);
    const stored = env.progress().reviewAttempts;
    assert.equal(stored[variant.variantId].status, 'passed', 'review attempts keep their own key');
    assert.ok(!Object.keys(stored).some(key => key.includes('.kata-')), 'a review never writes a kata key');
  } finally { env.dom.window.close(); }
});
