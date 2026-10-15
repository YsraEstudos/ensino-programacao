// Prova da seleção de katas intercalados (Fase 6.3): public/kata-selector.js.
import assert from 'node:assert/strict';
import test from 'node:test';
await import('../public/kata-selector.js');
const {selectSession: selectWithSources, validateKataPrompt, coverageByBand, createSeededRandom, BANDS, DEFAULT_LIMIT} = globalThis.DevPathKataSelector;

const variant = (id, concept, overrides = {}) => ({
  variantId: `var.${id}`,
  conceptId: concept,
  sourceActivityId: overrides.sourceActivityId ?? `${concept}-src`,
  prerequisites: overrides.prerequisites ?? [],
  format: 'predict-code',
  environment: 'javascript',
  evaluator: 'output-match',
  bands: overrides.bands ?? ['07', '11'],
  transferDecision: 'decisão transferida',
  contentVersion: 1,
  prompt: overrides.prompt ?? `Preveja o resultado do caso ${id}.`,
  ...overrides,
});

// Kata eligibility also requires the source activity to be studied; these cases focus on the other rules, so the
// helper marks every source as studied. The source rule has its own test below.
const asList = studied => studied instanceof Set ? [...studied] : Array.isArray(studied) ? studied : [];
const selectSession = (options = {}) => selectWithSources({
  ...options,
  studied: [...asList(options.studied), ...(options.variants ?? []).map(item => item?.sourceActivityId).filter(Boolean)],
});

const conceptsOf = session => session.items.map(item => item.conceptId);
const noConsecutiveRepeat = items => items.every((item, index) => index === 0 || item.conceptId !== items[index - 1].conceptId);

test('invalid band and invalid limit are reported or rejected', () => {
  assert.equal(selectSession({variants: [variant('a', 'c1')], band: '03'}).reason, 'invalid-band');
  assert.throws(() => selectSession({variants: [], band: '07', limit: 0}), RangeError);
  assert.throws(() => selectSession({variants: [], band: '07', limit: 2.5}), RangeError);
  assert.deepEqual(BANDS, ['07', '11', '14', '18']);
  assert.equal(DEFAULT_LIMIT, 5);
});

test('variants whose prerequisites are not all studied are excluded', () => {
  const variants = [
    variant('ok', 'c1', {prerequisites: ['01.01']}),
    variant('missing', 'c2', {prerequisites: ['01.01', '02.05']}),
    variant('other-band', 'c3', {bands: ['14']}),
  ];
  const session = selectSession({variants, band: '07', studied: ['01.01'], seed: 3});
  assert.equal(session.kind, 'simple');
  assert.deepEqual(session.items.map(item => item.variantId), ['var.ok']);
  const none = selectSession({variants, band: '07', studied: [], seed: 3});
  assert.equal(none.kind, 'empty');
  assert.equal(none.reason, 'no-eligible-variants');
});

test('a Set of studied activities works the same as an array', () => {
  const variants = [variant('a', 'c1', {prerequisites: ['x']})];
  assert.equal(selectSession({variants, band: '07', studied: new Set(['x']), seed: 1}).items.length, 1);
});

test('with two or more eligible concepts the session mixes them and never repeats one back to back when avoidable', () => {
  const variants = [
    variant('a1', 'c1'), variant('a2', 'c1'), variant('a3', 'c1'), variant('a4', 'c1'),
    variant('b1', 'c2'), variant('b2', 'c2'),
    variant('c1x', 'c3'),
  ];
  for (let seed = 1; seed <= 25; seed += 1) {
    const session = selectSession({variants, band: '11', studied: [], seed, limit: 5});
    assert.equal(session.kind, 'mixed');
    assert.equal(session.items.length, 5);
    assert(new Set(conceptsOf(session)).size >= 2, `seed ${seed} must mix at least two concepts`);
    assert(noConsecutiveRepeat(session.items), `seed ${seed} repeats a concept back to back: ${conceptsOf(session).join(',')}`);
    assert.equal(new Set(session.items.map(item => item.variantId)).size, 5, 'no variant appears twice');
  }
});

test('two concepts with one variant each still mix, and the session is short rather than repeating', () => {
  const variants = [variant('a', 'c1'), variant('b', 'c2')];
  const session = selectSession({variants, band: '07', studied: [], seed: 9, limit: 5});
  assert.equal(session.kind, 'mixed');
  assert.equal(session.items.length, 2);
  assert.equal(new Set(conceptsOf(session)).size, 2);
});

test('the per-session limit is respected and configurable', () => {
  const variants = Array.from({length: 12}, (_, i) => variant(`v${i}`, `c${i % 3}`));
  assert.equal(selectSession({variants, band: '07', seed: 4}).items.length, DEFAULT_LIMIT);
  assert.equal(selectSession({variants, band: '07', seed: 4, limit: 2}).items.length, 2);
  assert.equal(selectSession({variants, band: '07', seed: 4, limit: 9}).items.length, 9);
});

test('a limit of one cannot mix concepts and is reported as empty with a reason', () => {
  const variants = [variant('a', 'c1'), variant('b', 'c2')];
  const session = selectSession({variants, band: '07', seed: 1, limit: 1});
  assert.equal(session.kind, 'empty');
  assert.equal(session.reason, 'limit-too-small-to-mix');
});

test('with exactly one eligible concept the session is simple practice and flagged kind simple', () => {
  const variants = [variant('a', 'c1'), variant('b', 'c1'), variant('c', 'c1', {bands: ['14']})];
  const session = selectSession({variants, band: '07', seed: 2, limit: 5});
  assert.equal(session.kind, 'simple');
  assert.equal(session.concept, 'c1');
  assert.equal(session.items.length, 2);
  assert.deepEqual(session.concepts, ['c1']);
});

test('with no eligible variants the session is empty with a reason', () => {
  const session = selectSession({variants: [], band: '18', seed: 1});
  assert.deepEqual({kind: session.kind, items: session.items, reason: session.reason}, {kind: 'empty', items: [], reason: 'no-eligible-variants'});
});

test('kata prompts that name the source activity or announce a method are rejected from the session', () => {
  const variants = [
    variant('title', 'c1', {sourceTitle: 'Cache sem limite', prompt: 'Num cache sem limite, qual chave sai primeiro?'}),
    variant('hint', 'c2', {prompt: 'Use o Map para descobrir a ordem.'}),
    variant('clean', 'c3', {prompt: 'Qual chave sai primeiro após a leitura de A?'}),
  ];
  const session = selectSession({variants, band: '07', seed: 5, activityTitles: {'c2-src': 'Ordem de chaves'}});
  assert.equal(session.kind, 'simple');
  assert.deepEqual(session.items.map(item => item.variantId), ['var.clean']);
  assert.equal(session.rejected, 2);
  const allRejected = selectSession({variants: variants.slice(0, 2), band: '07', seed: 5});
  assert.equal(allRejected.reason, 'all-eligible-rejected');
});

test('activity titles supplied as a Map are also checked', () => {
  const v = variant('m', 'c1', {sourceActivityId: 'act-9', prompt: 'Explique o comportamento de Ordem de Chaves aqui.'});
  assert.equal(validateKataPrompt(v, {activityTitles: new Map([['act-9', 'Ordem de chaves']])}).reason, 'mentions-source-activity');
  assert.equal(validateKataPrompt(v, {activityTitles: {}}).ok, true);
});

test('validateKataPrompt heuristics: method hints, empty prompts and accent-insensitive titles', () => {
  assert.equal(validateKataPrompt({prompt: 'use Object.keys para listar'}).reason, 'announces-method');
  assert.equal(validateKataPrompt({prompt: 'Utilize a função de cache.'}).reason, 'announces-method');
  assert.equal(validateKataPrompt({prompt: 'Qual o valor de x depois da atribuição?'}).ok, true);
  assert.equal(validateKataPrompt({prompt: '   '}).reason, 'empty-prompt');
  assert.equal(validateKataPrompt({prompt: 'Compare o resultado de Ação lenta aqui.', sourceTitle: 'acao LENTA'}).reason, 'mentions-source-activity');
});

test('the seeded random is deterministic and the same seed yields the same session', () => {
  const variants = Array.from({length: 10}, (_, i) => variant(`s${i}`, `c${i % 4}`));
  const first = selectSession({variants, band: '11', seed: 42});
  const second = selectSession({variants, band: '11', seed: 42});
  assert.deepEqual(first.items.map(item => item.variantId), second.items.map(item => item.variantId));
  const seq = createSeededRandom(7);
  const again = createSeededRandom(7);
  assert.deepEqual([seq(), seq(), seq()], [again(), again(), again()]);
});

test('an injected rng controls the order of the session', () => {
  const variants = [variant('a', 'c1'), variant('b', 'c2')];
  const high = selectSession({variants, band: '07', rng: () => 0.999});
  const low = selectSession({variants, band: '07', rng: () => 0});
  assert.equal(high.kind, 'mixed');
  assert.equal(low.kind, 'mixed');
  assert.notDeepEqual(high.items.map(item => item.variantId), low.items.map(item => item.variantId));
});

test('coverageByBand counts variants and concepts per band and ignores malformed entries', () => {
  const variants = [
    variant('a', 'c1', {bands: ['07', '11']}),
    variant('b', 'c1', {bands: ['07']}),
    variant('c', 'c2', {bands: ['14', '18']}),
    variant('a', 'c9', {bands: ['07']}),
    {variantId: 'broken', bands: ['07']},
    {variantId: 'x', conceptId: 'c1', bands: ['99']},
  ];
  const coverage = coverageByBand(variants);
  assert.deepEqual(Object.keys(coverage).sort(), ['07', '11', '14', '18']);
  assert.deepEqual(coverage['07'], {variants: 2, conceptCount: 1, concepts: {c1: 2}});
  assert.deepEqual(coverage['11'], {variants: 1, conceptCount: 1, concepts: {c1: 1}});
  assert.deepEqual(coverage['14'], {variants: 1, conceptCount: 1, concepts: {c2: 1}});
  assert.equal(coverage['18'].variants, 1);
  assert.deepEqual(coverageByBand(undefined)['07'], {variants: 0, conceptCount: 0, concepts: {}});
});

test('a variant whose source activity was not studied is excluded even when its prerequisites were', () => {
  const variants = [variant('src', 'c1', {sourceActivityId: '04.03', prerequisites: ['04.01']})];
  assert.equal(selectWithSources({variants, band: '07', studied: ['04.01'], seed: 1}).kind, 'empty');
  assert.equal(selectWithSources({variants, band: '07', studied: ['04.01', '04.03'], seed: 1}).items.length, 1);
});
