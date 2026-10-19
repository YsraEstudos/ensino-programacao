import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const answerSequence = 'map,filter,find,some,every,reduce,map,filter,find,some,every,reduce';
const bigOSequence = 'O(1),O(n),O(n²),O(log n),O(n log n),O(log n),O(1),O(n)';

const starter0701 = await read('course-src/starters/07.01/main.js');
const recipe07 = await read('course-src/recipes/07.py');
assert(!starter0701.replace(/\s/g, '').includes(answerSequence), '07.01 starter must not publish all 12 answers');
assert(!recipe07.replace(/\s/g, '').includes(answerSequence), '07.01 generated example must not publish all 12 answers as a hint');
assert(!recipe07.includes('A lista pública associa cada intenção à operação mais direta'), '07.01 description must match the blank, learner-completed table');
assert(!recipe07.includes('transformar todos, manter pares, achar primeiro, responder existência/universalidade e somar'), '07.01 resources must describe the current smaller example');
assert(recipe07.includes('Exemplo público: a pergunta “há algum item inválido?” pede uma resposta booleana;'), '07.01 resources should identify the visible example without giving the method table');
const {classificarIntencoes: prepararTabela, intencoes} = await import('../course-src/starters/07.01/main.js');
const respostasEmBranco = prepararTabela();
assert.equal(intencoes.length, 12);
assert(intencoes.every(intencao => typeof intencao === 'string'), '07.01 starter keeps the intentions as a separate list');
assert.equal(respostasEmBranco.length, 12);
assert(respostasEmBranco.every(metodo => metodo === ''), '07.01 classificarIntencoes keeps the reference array-of-strings contract with blank answers');
const {classificarIntencoes: referencia07} = await import('../course-src/solutions/07.01/main.js');
const respostasCertas = referencia07();
assert.equal(respostasCertas.length, respostasEmBranco.length);
assert(respostasCertas.every(metodo => typeof metodo === 'string'));
assert.notDeepEqual(respostasEmBranco, respostasCertas, 'the incomplete starter is distinguishable from the correctly classified reference');
const assessment07 = JSON.parse(await read('public/course-assessments.json'))['07.01'];
assert.deepEqual(assessment07.checks, ['rubric'], '07.01 is reviewed with its rubric, not a browser prediction table');
assert.equal(assessment07.environment, 'rubric');
assert.equal(assessment07.predictionTable, undefined);
assert.equal(assessment07.assertionCases[0].executionScope, 'source-suite-only; not evidence of browser behavior');

const starter0801 = await read('course-src/starters/08.01/main.js');
const recipe08 = await read('course-src/recipes/08.py');
assert(!recipe08.replace(/\s/g, '').includes(bigOSequence), '08.01 generated example must not publish the complete answer sequence as a hint');
const {analises: observacoes08} = await import('../course-src/starters/08.01/main.js');
const assessment08 = JSON.parse(await read('course-src/assessments.json'))['08.01'];
const publishedAssessment08 = JSON.parse(await read('public/course-assessments.json'))['08.01'];
const predictions08 = JSON.parse(await read('course-src/predictions.json'))['08.01'];
const expectedGrowth = JSON.parse(predictions08.cases[0].crescimentos);
assert.deepEqual(assessment08.predictionTable.fields[0].path, '[*].crescimento');
assert.deepEqual(publishedAssessment08.predictionTable.fields[0].path, '[*].crescimento');
assert.equal(assessment08.predictionTable.revealSourceAfterPrediction, true);
assert.equal(publishedAssessment08.predictionTable.revealSourceAfterPrediction, true);
assert.equal(assessment08.checks.includes('behavior'), true);
assert.deepEqual(observacoes08.map(item => item.crescimento), expectedGrowth, '08.01 starter must emit the observed values its prediction table compares');
assert.deepEqual(observacoes08.map(item => item.crescimento), ['O(1)', 'O(n)', 'O(n²)', 'O(log n)', 'O(n log n)', 'O(log n)', 'O(1)', 'O(n)']);

const controller08 = await read('public/course-controller.js');
assert.match(controller08, /const practiceSection = answerReady \?/);
assert.match(controller08, /const firstResponsePanel = answered \?/);
assert.match(controller08, /predictionTable\?\.revealSourceAfterPrediction === true/);
assert(controller08.indexOf('${firstResponsePanel}') < controller08.indexOf('${practiceSection}'), '08.01 first prediction is rendered before the gated practice/editor section');

assert.deepEqual(respostasCertas, ['map', 'filter', 'find', 'some', 'every', 'reduce', 'map', 'filter', 'find', 'some', 'every', 'reduce']);

const {analises} = await import('../course-src/solutions/08.01/main.js');
assert.deepEqual(analises.map(item => item.crescimento), expectedGrowth);
assert.notDeepEqual(analises.map(item => item.crescimento), Array(8).fill('O(1)'), 'a representative wrong complexity classification must differ from the reference');

const {ranking} = await import('../course-src/solutions/07.03/main.js');
assert.deepEqual(ranking([
  {id: 'bia', jogador: 'Bia', valida: true, pontos: 8},
  {id: 'ana', jogador: 'Ana', valida: true, pontos: 8},
  {id: 'invalid', jogador: 'Cris', valida: false, pontos: 99},
]), ['ana', 'bia']);
assert.notDeepEqual(ranking([{id: 'low', jogador: 'A', valida: true, pontos: 1}, {id: 'high', jogador: 'B', valida: true, pontos: 2}]), ['low', 'high'], 'ascending points are a representative wrong ranking');

const {migrar} = await import('../course-src/solutions/06.08/main.js');
assert.deepEqual(migrar('{"version":1,"volume":0}'), {version: 2, audio: {volume: 0}});
assert.deepEqual(migrar('{"version":3,"audio":{"volume":9}}'), {status: 'unsupported', version: 3});
assert.deepEqual(migrar('{broken'), {version: 2, audio: {volume: 50}});
assert.notDeepEqual(migrar('{"version":1,"volume":0}'), {version: 2, audio: {volume: 50}}, 'replacing a valid zero with the default is a representative migration error');

console.log('Fase 11 source and reference checks passed.');
