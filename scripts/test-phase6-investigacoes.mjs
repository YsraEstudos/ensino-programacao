// Fase 6 (item 6.4): investigações opcionais de código alheio 07.15, 11.15, 14.23 e 18.11.
// 07.15 (node-simulated) é avaliado pelo mesmo caminho do gate: starter reprova, referência passa, mutantes morrem.
// 11.15 (DOM) é conferido estaticamente aqui; sua execução no navegador foi verificada com o avaliador real (ver registro da Fase 6).
// 14.23 e 18.11 são leituras por rubrica (evidência declarada): conferem-se apenas arquivos, respostas e metadados.
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {after, before, describe, test} from 'node:test';
import {createContext, evaluateActivity} from './gate-execucao.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = file => JSON.parse(readFileSync(path.join(ROOT, file), 'utf8'));
const normalizeEol = value => value.replace(/\r\n/g, '\n');
const IDS = ['07.15', '11.15', '14.23', '18.11'];
const catalog = new Map(read('public/course-catalog.json').map(item => [item.id, item]));
const assessments = read('public/course-assessments.json');
const sourceAssessments = read('course-src/assessments.json');

function filesUnder(dir) {
  return readdirSync(dir).flatMap(entry => {
    const full = path.join(dir, entry);
    return statSync(full).isDirectory() ? filesUnder(full).map(file => path.posix.join(entry, file)) : [entry];
  });
}

describe('investigações 6.4: catálogo e metadados', () => {
  test('quatro IDs novos, opcionais, uma por faixa, com ambiente e tipo de evidência declarados', () => {
    for (const id of IDS) {
      const item = catalog.get(id);
      assert.ok(item, `${id} está no catálogo`);
      assert.equal(item.optional, true, `${id} é opcional`);
      assert.equal(item.assessmentEnvironment, sourceAssessments[id].environment, `${id} ambiente publicado`);
    }
    assert.deepEqual(IDS.map(id => catalog.get(id).stage), ['07', '11', '14', '18']);
    assert.equal(sourceAssessments['07.15'].environment, 'node-simulated');
    assert.equal(sourceAssessments['11.15'].environment, 'dom');
    assert.equal(sourceAssessments['14.23'].environment, 'rubric');
    assert.equal(sourceAssessments['18.11'].environment, 'rubric');
    for (const id of ['14.23', '18.11']) assert.match(sourceAssessments[id].evidenceNote, /Evidência declarada/, `${id} declara a evidência`);
  });

  test('os IDs novos não aparecem como pré-requisito de atividade do núcleo', () => {
    for (const item of catalog.values()) {
      for (const target of item.learningMetadata?.requires || []) {
        assert.ok(!IDS.includes(target), `${item.id} não pode depender de ${target}`);
      }
    }
  });

  test('cada investigação tem metadados de aprendizagem e vínculo opcional no mapa de conceitos', () => {
    const links = read('course-src/concept-links.json').concepts;
    const expected = {'07.15': 'arrays.pipeline', '11.15': 'forms.basic', '14.23': 'modules.project_structure', '18.11': 'ts.keyof_indexed_access'};
    for (const id of IDS) {
      assert.ok(Array.isArray(catalog.get(id).learningMetadata?.requires), `${id} tem requires`);
      const link = links.find(entry => entry.conceptId === expected[id]);
      assert.ok(link.optionalActivities.includes(id), `${id} está em optionalActivities de ${expected[id]}`);
    }
  });
});

describe('investigações 6.4: arquivos publicados e de origem coincidem', () => {
  test('mutantes em course-src/mutants/<id> são os mesmos publicados em mutantDirs', () => {
    for (const id of ['07.15', '11.15']) {
      const dir = path.join(ROOT, 'course-src', 'mutants', id);
      const onDisk = readdirSync(dir).sort();
      const inline = (sourceAssessments[id].mutantDirs || []).map(mutant => mutant.id).sort();
      assert.deepEqual(inline, onDisk, `${id} mutantes`);
      assert.ok(inline.length >= 3, `${id} tem pelo menos três mutantes`);
      for (const mutant of sourceAssessments[id].mutantDirs) {
        for (const file of mutant.files) {
          const disk = readFileSync(path.join(dir, mutant.id, file.path), 'utf8');
          assert.equal(normalizeEol(disk), normalizeEol(file.content), `${id}/${mutant.id}/${file.path}`);
        }
      }
    }
  });

  test('referência publicada coincide com solutions/<id>', () => {
    for (const id of ['07.15', '11.15']) {
      const dir = path.join(ROOT, 'course-src', 'solutions', id);
      for (const file of sourceAssessments[id].correctFiles) {
        assert.equal(normalizeEol(readFileSync(path.join(dir, file.path), 'utf8')), normalizeEol(file.content), `${id}/${file.path}`);
      }
    }
  });

  test('starters têm exatamente os arquivos do manifesto e sem arquivos ocultos', () => {
    const manifest = read('course-src/starters/manifest.json');
    for (const id of IDS) {
      assert.deepEqual(filesUnder(path.join(ROOT, 'course-src', 'starters', id)).sort(), [...manifest[id].files].sort(), id);
    }
  });
});

describe('investigação 07.15 avaliada pelo gate de execução', () => {
  let ctx;
  before(async () => { ctx = await createContext(); });
  after(async () => { await ctx?.close(); });

  test('starter reprova, referência passa e todos os mutantes morrem', {timeout: 120000}, async () => {
    const result = await evaluateActivity(ctx, '07.15', {timeoutMs: 3000});
    assert.equal(result.status, 'ok', JSON.stringify(result.problems));
    assert.equal(result.starter.kind, 'failed');
    assert.equal(result.reference.kind, 'passed');
    assert.equal(result.mutants.length, 4);
    assert.ok(result.mutants.every(mutant => mutant.killed), JSON.stringify(result.mutants));
  });
});
