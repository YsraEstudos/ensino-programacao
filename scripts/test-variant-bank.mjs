import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import {format} from 'node:util';
import {fileURLToPath} from 'node:url';
import {validateVariantBank} from './validate-course-catalog.mjs';
import {createContext} from './gate-execucao.mjs';
import {publishVariantBank} from '../course-src/build-public-curriculum.mjs';
import {loadVariantBank} from '../course-src/variant-sources.mjs';

// Fase 6 (6.1): banco de variantes. Valida o contrato, prova que o starter reprova, a referência passa e os mutantes reprovam
// no mesmo avaliador publicado, e confere que as previsões de código produzem a saída declarada. Variantes não alteram o catálogo.
const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => JSON.parse(readFileSync(path.join(root, file), 'utf8'));
const FAILING = new Set(['failed', 'timeout', 'error', 'type-error']);

const bank = loadVariantBank();
const pilotBank = read('course-src/variant-bank.json');
const published = read('public/course-variants.json');
const catalog = read('public/course-catalog.json');
const resolved = read('course-src/.generated/resolved_preview.json');
const graph = read('course-src/.generated/concept_graph.json');
const activities = resolved.map(item => ({id: item.id, stage: item.stage}));
const concepts = new Map(graph.concepts.map(concept => [concept.id, concept]));
const stageOf = new Map(resolved.map(item => [item.id, item.stage]));
const validate = variants => validateVariantBank({version: 1, variants}, {activities, concepts});
const clone = value => JSON.parse(JSON.stringify(value));
const variantById = id => clone(bank.variants.find(variant => variant.variantId === id));
const pilot = id => variantById(id);
const EXECUTABLE_PILOT = bank.variants.filter(variant => variant.format === 'short-fix' || variant.format === 'mini-impl');
const PREDICT_CODE = bank.variants.filter(variant => variant.format === 'predict-code');
const BASE_ID = 'var.04.03.mini-cotacao-entrega';

test('o banco-fonte e a publicação passam na validação', () => {
  const summary = validate(bank.variants);
  assert.equal(summary.variants, bank.variants.length);
  assert.equal(pilotBank.variants.length, 12);
  assert.ok(bank.variants.length >= 12);
});

test('a publicação é determinística, ordenada e idêntica à saída do build', () => {
  const rebuilt = publishVariantBank(bank, resolved, graph);
  assert.deepEqual(rebuilt, published);
  const ids = published.variants.map(variant => variant.variantId);
  assert.deepEqual(ids, [...ids].sort());
  assert.equal(new Set(ids).size, ids.length);
});

test('cada conceito do piloto tem uma variante de cada formato', () => {
  const byConcept = new Map();
  for (const variant of pilotBank.variants) {
    const formats = byConcept.get(variant.conceptId) ?? new Set();
    formats.add(variant.format);
    byConcept.set(variant.conceptId, formats);
  }
  assert.equal(byConcept.size, 4);
  for (const [concept, formats] of byConcept) {
    assert.ok(formats.has('choice-predict'), `${concept}: choice-predict`);
    assert.ok(formats.has('predict-code'), `${concept}: predict-code`);
    assert.ok(formats.has('short-fix') || formats.has('mini-impl'), `${concept}: executável`);
  }
});

test('validador rejeita identificador duplicado', () => {
  const copy = clone(bank.variants);
  copy[1].variantId = copy[0].variantId;
  assert.throws(() => validate(copy), /Duplicate variant ID/);
});

test('validador rejeita identificador no formato NN.NN', () => {
  assert.throws(() => validate([{...pilot(BASE_ID), variantId: '04.03'}]), /collides with an activity ID/);
  assert.throws(() => validate([{...pilot(BASE_ID), variantId: '99.99'}]), /collides with an activity ID/);
});

test('validador rejeita atividade de origem desconhecida', () => {
  assert.throws(() => validate([{...pilot(BASE_ID), sourceActivityId: '99.99'}]), /Unknown source activity/);
});

test('validador rejeita identificador que não corresponde à atividade de origem', () => {
  assert.throws(() => validate([{...pilot(BASE_ID), sourceActivityId: '04.11'}]), /does not match its source activity 04\.11/);
});

test('validador rejeita pré-requisito posterior à origem', () => {
  assert.throws(() => validate([{...pilot(BASE_ID), prerequisites: ['04.11']}]), /comes after source 04\.03/);
});

test('validador rejeita pré-requisito inexistente', () => {
  assert.throws(() => validate([{...pilot(BASE_ID), prerequisites: ['99.01']}]), /Unknown prerequisite/);
});

test('validador rejeita conceito introduzido depois da atividade de origem', () => {
  assert.throws(() => validate([{...pilot(BASE_ID), conceptId: 'closures.basic'}]), /introduced after source 04\.03/);
});

test('validador rejeita conceito fora do grafo da Fase 4', () => {
  assert.throws(() => validate([{...pilot(BASE_ID), conceptId: 'conceito.inexistente'}]), /Unknown concept/);
});

test('validador rejeita mini-implementação em ambiente de rubrica', () => {
  assert.throws(() => validate([{...pilot(BASE_ID), environment: 'rubric'}]), /requires a browser-executable environment/);
});

test('validador rejeita resposta fora do intervalo', () => {
  const choice = pilot('var.04.03.escolha-chamada-antes-const');
  assert.throws(() => validate([{...choice, answer: choice.choices.length}]), /Answer out of range/);
  assert.throws(() => validate([{...choice, answer: -1}]), /Answer out of range/);
});

test('validador exige feedback para cada alternativa errada', () => {
  const choice = pilot('var.04.03.escolha-chamada-antes-const');
  delete choice.feedback.byChoice['1'];
  assert.throws(() => validate([choice]), /Missing feedback for wrong choice 1/);
});

test('validador rejeita variante executável sem mutante', () => {
  const executable = pilot(BASE_ID);
  executable.mutants = [];
  assert.throws(() => validate([executable]), /needs at least one mutant/);
});

test('validador rejeita mutante idêntico à referência', () => {
  const executable = pilot(BASE_ID);
  executable.mutants[0].files = clone(executable.correctFiles);
  assert.throws(() => validate([executable]), /identical to the reference/);
});

test('validador rejeita banda de kata que não é posterior à origem', () => {
  assert.throws(() => validate([{...pilot(BASE_ID), bands: ['04']}]), /Invalid kata bands/);
});

test('o identificador de variante nunca coincide com um identificador do catálogo', () => {
  const catalogIds = new Set(catalog.map(item => item.id));
  assert.equal(catalog.length, resolved.length);
  assert.deepEqual(catalog.map(item => item.id), resolved.map(item => item.id));
  for (const variant of published.variants) assert.equal(catalogIds.has(variant.variantId), false, variant.variantId);
});

// Catálogo antes da Fase 6 (item 6.4) somava 302; as quatro investigações e as quatro atividades da Fase 7 são acrescentadas.
const CATALOG_BEFORE_6_4 = 302;
const INVESTIGATIONS_6_4 = ['07.15', '11.15', '14.23', '18.11'];
const PHASE7_EXERCISES = ['24.01', '24.02', '24.03', '24.04'];
test('variantes não entram na contagem de atividades do catálogo', () => {
  assert.equal(catalog.length, CATALOG_BEFORE_6_4 + INVESTIGATIONS_6_4.length + PHASE7_EXERCISES.length);
  assert.equal(catalog.filter(item => item.id.startsWith('var.')).length, 0);
  for (const id of INVESTIGATIONS_6_4) assert.equal(catalog.find(item => item.id === id)?.optional, true, `${id} é opcional`);
});

// Behavior variants run through the same evaluator the browser uses (public/course-assessment.js inside the jsdom harness).
test('variantes executáveis: starter reprova, referência passa e mutantes reprovam', async t => {
  const ctx = await createContext();
  t.after(() => ctx.close());
  for (const source of EXECUTABLE_PILOT) {
    const variant = published.variants.find(item => item.variantId === source.variantId);
    const starterFiles = variant.starterFiles;
    const referenceFiles = variant.correctFiles;
    const assessment = {environment: 'javascript', version: 1, checks: ['behavior'], testPath: variant.testPath, tests: variant.tests, timeoutMs: 3000};
    const item = {id: variant.variantId, title: variant.variantId, stage: stageOf.get(variant.sourceActivityId), starterFiles};
    const run = (files, label) => ctx.evaluate({item, assessment, files, fingerprint: `variant-${variant.variantId}-${label}`});
    await t.test(variant.variantId, async () => {
      const starter = await run(starterFiles, 'starter');
      assert.ok(FAILING.has(starter.kind), `starter deve reprovar: ${starter.kind} ${starter.text}`);
      const reference = await run(referenceFiles, 'reference');
      assert.equal(reference.kind, 'passed', `referência deve passar: ${reference.kind} ${reference.text}`);
      assert.ok(variant.mutants.length >= 1, 'pelo menos um mutante real');
      for (const mutant of variant.mutants) {
        const overlay = new Map([...referenceFiles, ...mutant.files].map(file => [file.path, file]));
        const result = await run([...overlay.values()], `mutant-${mutant.id}`);
        assert.ok(FAILING.has(result.kind), `mutante ${mutant.id} deve reprovar: ${result.kind} ${result.text}`);
      }
    });
  }
});

// Predict-code variants: executing the published code must print exactly the declared output (console.log lines joined by newlines).
for (const source of PREDICT_CODE) {
  test(`previsão de código: ${source.variantId} produz a saída declarada`, () => {
    const variant = published.variants.find(item => item.variantId === source.variantId);
    const lines = [];
    const sandbox = {console: {log: (...args) => lines.push(format(...args))}};
    vm.runInNewContext(variant.code, sandbox, {timeout: 1000});
    assert.equal(lines.join('\n'), variant.expectedOutput);
  });
}

test('cada conceito não isento soma ao menos 3 variações (atividades obrigatórias vinculadas + variantes)', () => {
  const links = read('course-src/concept-links.json').concepts;
  const byConcept = new Map();
  for (const variant of bank.variants) byConcept.set(variant.conceptId, (byConcept.get(variant.conceptId) ?? 0) + 1);
  const short = links
    .filter(link => link.decision !== 'exempt' && link.activities.length + (byConcept.get(link.conceptId) ?? 0) < 3)
    .map(link => link.conceptId);
  assert.deepEqual(short, []);
});
