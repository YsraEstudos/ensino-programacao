import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const read = path => readFileSync(path, 'utf8');
const catalog = JSON.parse(read('public/course-catalog.json'));
const assessments = JSON.parse(read('course-src/assessments.json'));
const find = id => catalog.find(item => item.id === id);

test('04.03 publica quatro blocos reais e executa a chamada D depois das declarações', () => {
  const starter = read('course-src/starters/04.03/main.js');
  const solution = read('course-src/solutions/04.03/main.js');
  const result = spawnSync(process.execPath, ['course-src/solutions/04.03/main.js'], {encoding: 'utf8'});
  assert.match(starter, /cParaF/);
  assert.match(starter, /formatar/);
  assert.match(starter, /exibir/);
  assert.match(starter, /console\.log\(exibir\(0\)\)/);
  assert.match(starter, /exibir\s*=\s*celsius\s*=>\s*formatar\(cParaF\(celsius\)\)/);
  const declarations = starter.split(/\r?\n/).filter(line => line.startsWith('export const '));
  const byName = Object.fromEntries(declarations.map(line => [line.match(/^export const (\w+)/)[1], line]));
  for (const order of [
    ['cParaF', 'formatar', 'exibir'], ['formatar', 'cParaF', 'exibir'],
    ['cParaF', 'exibir', 'formatar'], ['formatar', 'exibir', 'cParaF'],
    ['exibir', 'cParaF', 'formatar'], ['exibir', 'formatar', 'cParaF'],
  ]) {
    const reordered = `${order.map(name => byName[name]).join('\n')}\nconsole.log(exibir(0));\n`;
    const orderedRun = spawnSync(process.execPath, ['--input-type=module', '--eval', reordered], {encoding: 'utf8'});
    assert.equal(orderedRun.status, 0, orderedRun.stderr);
    assert.equal(orderedRun.stdout.trim(), '32 °F');
  }
  assert.match(solution, /console\.log\(exibir\(0\)\)/);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), '32 °F');
  assert.ok(find('04.03').rubric.length >= 3);
});

test('04.07 tem casos que distinguem Math.round de Math.ceil', () => {
  const source = read('course-src/tests/04.07.test.js');
  assert.match(source, /adicionarTaxa\(1,\s*0\.1\)\)\.toBe\(1\)/);
  assert.match(source, /adicionarTaxa\(333,\s*0\.07\)\)\.toBe\(356\)/);
});

test('READ 04.02 tem três critérios observáveis', () => {
  assert.equal(find('04.02').rubric.length, 3);
  assert.ok(find('04.02').rubric.every(criterion => criterion.trim().length > 0));
});

test('cada atividade executável escolhida preserva avaliação behavior e publica mutante com referência', () => {
  const ids = ['03.10', '04.03', '04.04', '04.05', '04.06', '04.07', '04.08', '04.09', '04.10', '04.11', '04.12', '04.13', '04.14', '05.02', '05.03', '05.04', '05.05', '05.06', '05.07', '05.08', '05.09', '05.10'];
  for (const id of ids) {
    assert.ok(assessments[id].checks.includes('behavior'), `${id} retains behavior assessment`);
    assert.ok(!assessments[id].checks.includes('mutation'), `${id} does not route implementation grading through student-suite mode`);
    assert.ok(assessments[id].correctFiles?.some(file => file.path === 'main.js'), `${id} embeds its reference for the execution gate`);
    assert.ok(assessments[id].mutantDirs?.length, `${id} declares a representative mutant`);
  }
});

test('pré-requisitos antecipados têm primer publicado na preparação', () => {
  for (const id of ['04.02', '04.05', '04.07', '05.03', '05.04', '05.07']) {
    assert.ok(find(id).primers?.length, `${id} publishes its prerequisite primer`);
  }
});
