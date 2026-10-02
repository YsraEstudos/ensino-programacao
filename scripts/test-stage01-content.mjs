import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { stage01Preparation } from '../../course-src/stage01-preparation.mjs';

const runnerContext = { console };
vm.runInNewContext(fs.readFileSync(new URL('../public/js-stage01-runner.js', import.meta.url), 'utf8'), runnerContext);
const runner = runnerContext.DevPathStage01Runner;
const checksContext = { console, DevPathStage01Runner: runner, DevPathStage01Preparation: stage01Preparation };
vm.runInNewContext(fs.readFileSync(new URL('../public/js-stage01-checks.js', import.meta.url), 'utf8'), checksContext);

const ids = Object.keys(stage01Preparation);
const publicContext = {};
vm.runInNewContext(fs.readFileSync(new URL('../public/js-stage01-preparation.js', import.meta.url), 'utf8'), publicContext);
const safePreparation = JSON.parse(JSON.stringify(stage01Preparation));
for (const config of Object.values(safePreparation)) for (const transfer of config.masteryTransfers || []) delete transfer.solution;
assert.equal(JSON.stringify(publicContext.DevPathStage01Preparation), JSON.stringify(safePreparation), 'Published preparation must match the editorial source without transfer solutions');
assert.deepEqual(ids, ['01.01','01.02','01.03','01.04','01.05','01.06','01.07','01.08','01.09']);

const predictionCounts = {'01.01':5,'01.02':4,'01.03':2,'01.04':6,'01.05':4,'01.06':1,'01.07':1,'01.08':2,'01.09':3};
const modes = ['predict','trace','parsons','faded','predict','faded','make','transfer','project'];
ids.forEach((id, i) => {
  const item = stage01Preparation[id];
  assert.equal(item.mode, modes[i], `${id} mode`);
  assert.equal(item.predictionRows.length, predictionCounts[id], `${id} prediction rows`);
  assert.equal(typeof item.explanation, 'string');
  assert.equal(typeof item.workedExample.code, 'string');
  assert.ok(item.workedExample.output.length > 0);
  assert.equal(item.hints.length, 3);
  assert.ok(item.docs.some(doc => doc.title.includes('MDN')));
  const result = runner.run(item.workedExample.code);
  assert.equal(result.ok, true, `${id} worked example runs`);
  assert.equal(JSON.stringify(result.lines.map(line => line.values.map(String).join(' '))), JSON.stringify(item.workedExample.output.map(String)), `${id} worked example output`);
});

assert.equal(stage01Preparation['01.01'].readonly, true);
assert.equal(stage01Preparation['01.02'].readonly, true);
assert.equal(stage01Preparation['01.05'].readonly, true);
assert.deepEqual(stage01Preparation['01.01'].predictionRows.map(row => row.label), ['typeof 42','typeof "42"','typeof true','typeof undefined','typeof null']);
assert.deepEqual(stage01Preparation['01.02'].predictionRows.map(row => row.label), ['após const base = 2','após let total = base','após total = total + 3','saída']);
assert.deepEqual(stage01Preparation['01.03'].parsons.initialOrder, ['E','C','D','B','A']);
assert.deepEqual(stage01Preparation['01.04'].blanks.map(({name, choices}) => ({name, choices})), [
  {name:'nome', choices:['const','let']}, {name:'pontos', choices:['const','let']},
  {name:'ativo', choices:['const','let']}, {name:'volume', choices:['const','let']},
  {name:'idioma', choices:['const','let']}, {name:'tentativas', choices:['const','let']},
]);
assert.equal(stage01Preparation['01.06'].contract, 'Nara: nível 3');
assert.equal('starter' in stage01Preparation['01.06'], false);
assert.deepEqual(stage01Preparation['01.09'].contract, [
  'Iris | nível 1 | vida 10 | ativa',
  'Iris | nível 1 | vida 6 | ativa',
  'Iris | nível 1 | vida 0 | ativa',
]);
assert.equal('starter' in stage01Preparation['01.09'], false);
assert.match(stage01Preparation['01.08'].workedExample.output.join('\n'), /Agenda \| duração 15 \| avisos false/);
assert.equal(stage01Preparation['01.09'].masteryTransfers.length, 2);
for (const transfer of stage01Preparation['01.09'].masteryTransfers) {
  assert.equal(transfer.cases.length, 2);
  assert.ok(transfer.cases.every(testCase => testCase.label && testCase.fixtures && testCase.expected));
  assert.ok(Object.values(transfer.requiredKinds).includes('const') && Object.values(transfer.requiredKinds).includes('let'));
  const result = checksContext.DevPathStage01Checks.checkTransfer(transfer.id, transfer.solution);
  assert.equal(result.ok, true, `${transfer.id} mastery transfer solution`);
}
console.log('Stage 01 preparation contract passed.');
