import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {copyFileSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import * as esbuild from 'esbuild-wasm';
import {parse} from 'acorn';
import {setup} from './course-runner-harness.mjs';

// Fase 4 (análise curricular, itens 4.1–4.14): conceitos com pré-requisito verificado, atividades novas
// com starter que reprova e referência que aprova, e ordem publicada que respeita os pré-requisitos.
const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => JSON.parse(readFileSync(path.join(root, file), 'utf8'));
const NEW_JS = ['04.14', '05.12', '05.13', '05.14', '05.15', '07.13', '09.09', '10.09', '12.17', '12.18', '12.19', '12.20', '13.15', '21.13'];
const NEW_ALL = [...NEW_JS];

const catalog = read('public/course-catalog.json');
const assessments = read('public/course-assessments.json');
const sourceAssessments = read('course-src/assessments.json');
const learningMetadata = read('course-src/learning-metadata.json');
const compiled = read('course-src/.generated/resolved_preview.json');
const baselineCatalog = read('output/fase2/catalog-before.json');
const moduleGraph = (() => {
  const w = {TextEncoder};
  w.window = w;
  vm.runInThisContext('(function(window){' + readFileSync(path.join(root, 'public/module-graph.js'), 'utf8') + '})')(w);
  return w.DevPathModuleGraph;
})();
const assessmentSource = readFileSync(path.join(root, 'public/course-assessment.js'), 'utf8');

function runValidator(sourcePath, env = {}) {
  return spawnSync(process.execPath, [path.join(root, 'scripts/validate-curriculum-source.mjs'), '--source', sourcePath], {
    cwd: root, encoding: 'utf8', env: {...process.env, ...env},
  });
}

function solutionFiles(referenceDir) {
  const base = path.join(root, 'course-src', referenceDir);
  const walk = (dir, prefix = '') => readdirSync(dir, {withFileTypes: true}).flatMap(entry => entry.isDirectory()
    ? walk(path.join(dir, entry.name), `${prefix}${entry.name}/`)
    : entry.name.endsWith('.md') ? [] : [{path: `${prefix}${entry.name}`, content: readFileSync(path.join(dir, entry.name), 'utf8')}]);
  return walk(base);
}

function assessmentContext(env) {
  env.w.eval(readFileSync(path.join(root, 'public/course-node-runtime.js'), 'utf8'));
  const w = {
    TextEncoder,
    DevPathNodeRuntime: env.w.DevPathNodeRuntime,
    DevPathModuleGraph: {
      buildModuleGraph: input => moduleGraph.buildModuleGraph(input, {
        build: esbuild.build, parse, transform: esbuild.transform, runtime: input.runtime,
      }),
    },
    DevPathCourseRunner: {
      run(code, finish, options) {
        return env.w.DevPathCourseRunner.run(code, (kind, text, tests, node) => finish(kind, text, tests, node), options);
      },
    },
  };
  w.window = w;
  vm.runInNewContext(assessmentSource, w);
  return w;
}

test('o validador de conceitos reprova conceito usado antes da etapa que o ensina, salvo com primer publicado', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'devpath-phase4-concepts-'));
  try {
    copyFileSync(path.join(root, 'course-src/.generated/concept_graph.json'), path.join(dir, 'concept_graph.json'));
    const cards = structuredClone(compiled);
    const card = cards.find(item => item.id === '04.11');
    const main = card.learner.starter_files.find(file => file.path === 'main.js');
    main.content += '\nexport const pendente = Promise.resolve(1);\n';
    const source = path.join(dir, 'resolved_preview.json');
    writeFileSync(source, JSON.stringify(cards));

    const failing = runValidator(source, {DEVPATH_PRIMER_COVERAGE: path.join(root, 'course-src/concept-coverage.json')});
    assert.equal(failing.status, 1, failing.stdout + failing.stderr);
    assert.match(failing.stderr, /ERROR 04\.11 AST_PREREQUISITE_UNDECLARED/);

    const coverage = path.join(dir, 'coverage.json');
    writeFileSync(coverage, JSON.stringify({'04.01': ['arrays.pipeline', 'callbacks.basic'], '04.11': ['async.promise']}));
    const covered = runValidator(source, {DEVPATH_PRIMER_COVERAGE: coverage});
    assert.equal(covered.status, 0, covered.stdout + covered.stderr);
    assert.doesNotMatch(covered.stderr, /AST_PREREQUISITE_UNDECLARED/);
  } finally {
    rmSync(dir, {recursive: true, force: true});
  }
});

test('o primer é a única razão para 04.01 passar: sem cobertura, o uso de arrays e callbacks reprova', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'devpath-phase4-primer-'));
  try {
    const empty = path.join(dir, 'empty.json');
    writeFileSync(empty, '{}');
    const result = runValidator(path.join(root, 'course-src/.generated/resolved_preview.json'), {DEVPATH_PRIMER_COVERAGE: empty});
    assert.equal(result.status, 1);
    assert.match(result.stderr, /ERROR 04\.01 AST_PREREQUISITE_UNDECLARED: .*arrays\.pipeline/);
    assert.match(result.stderr, /ERROR 04\.01 AST_PREREQUISITE_UNDECLARED: .*callbacks\.basic/);

    const real = runValidator(path.join(root, 'course-src/.generated/resolved_preview.json'));
    assert.equal(real.status, 0, real.stdout + real.stderr);
  } finally {
    rmSync(dir, {recursive: true, force: true});
  }
});

test('as atividades novas são publicadas com os metadados e a avaliação declarados', () => {
  for (const id of NEW_ALL) {
    assert(catalog.some(item => item.id === id), `${id} is published`);
    assert(sourceAssessments[id], `${id} has a canonical assessment`);
  }
  for (const id of NEW_JS) {
    assert.equal(sourceAssessments[id].environment, 'javascript', `${id} runs in the published evaluator`);
    assert(sourceAssessments[id].testPath && sourceAssessments[id].referenceDir, `${id} has a suite and a reference`);
    assert(assessments[id]?.tests, `${id} publishes its executable assessment`);
    assert(sourceAssessments[id].assertionCases?.length > 0, `${id} has annotated assertion cases`);
  }
  assert.equal(sourceAssessments['05.14'].environment, 'javascript');
  assert.equal(sourceAssessments['05.14'].rubric.length, 3, '05.14 preserves its conceptual rubric');
  assert.equal(assessments['05.14'].rubric.length, 3, '05.14 publishes three rubric criteria');
  assert.notEqual(sourceAssessments['05.14'].evidenceLabel, 'rubric-declared');
});

// Um starter pode cumprir uma borda do contrato (por exemplo, texto sem data permanece igual); basta um teste reprová-lo.
test('o avaliador publicado reprova cada starter novo e aprova a referência', async () => {
  const env = setup();
  try {
    const evaluator = assessmentContext(env);
    for (const id of NEW_JS) {
      const item = catalog.find(entry => entry.id === id);
      const assessment = assessments[id];
      const reference = await evaluator.DevPathAssessment.run({
        item, assessment, files: solutionFiles(sourceAssessments[id].referenceDir), fingerprint: `phase4-reference-${id}`,
      });
      const starter = await evaluator.DevPathAssessment.run({
        item, assessment, files: item.starterFiles, fingerprint: `phase4-starter-${id}`,
      });
      assert.equal(reference.kind, 'passed', `${id} reference: ${reference.text}`);
      assert.equal(reference.tests.failed, 0, `${id} reference failed tests`);
      assert(reference.tests.total > 0, `${id} has no behavioral assertions`);
      assert.equal(starter.kind, 'failed', `${id} starter should fail behavior checks: ${starter.text}`);
      assert(starter.tests.failed > 0, `${id} starter passes every behavior check`);
    }
  } finally {
    await env.close();
  }
});

test('4.3: o avaliador usa colação portuguesa no desempate por nome', async () => {
  const env = setup();
  try {
    const evaluator = assessmentContext(env);
    const item = catalog.find(entry => entry.id === '07.03');
    const assessment = assessments['07.03'];
    const reference = await evaluator.DevPathAssessment.run({
      item, assessment, files: solutionFiles(sourceAssessments['07.03'].referenceDir), fingerprint: 'phase4-locale-reference',
    });
    const starter = await evaluator.DevPathAssessment.run({
      item, assessment, files: item.starterFiles, fingerprint: 'phase4-locale-starter',
    });
    assert.equal(reference.kind, 'passed', `07.03 reference: ${reference.text}`);
    assert.equal(reference.tests.failed, 0, '07.03 reference failed tests');
    assert.equal(starter.kind, 'failed', `07.03 starter should fail behavior checks: ${starter.text}`);
    assert(starter.tests.failed > 0, '07.03 starter passes every behavior check');
  } finally {
    await env.close();
  }
});

test('a ordem publicada respeita os pré-requisitos e preserva a ordem das atividades existentes', () => {
  const order = catalog.map(item => item.id);
  const position = id => order.indexOf(id);
  for (const id of NEW_ALL) {
    for (const required of learningMetadata[id].requires) {
      assert(position(required) < position(id), `${id} requires ${required}, which must come first`);
    }
  }
  assert(position('07.13') < position('07.06'), 'reduce from scratch comes before the refactor of reduce');
  assert(position('13.10') < position('13.15') && position('13.15') < position('13.11'), 'custom errors follow cause');
  assert(position('12.10') < position('12.19') && position('12.19') < position('12.11'), 'URL follows HTTP');
  assert(position('12.12') < position('12.20') && position('12.20') < position('12.13'), 'Intl follows time');
  const existing = baselineCatalog.map(item => item.id).filter(id => position(id) >= 0);
  const currentOrderOfExisting = order.filter(id => existing.includes(id));
  assert.deepEqual(existing, currentOrderOfExisting, 'existing activities keep their relative order');
  assert.equal(compiled.length, catalog.length, 'the compiled preview and the published catalog agree');
});

test('classificação de núcleo e opcional segue a decisão da Fase 4', () => {
  const byId = new Map(catalog.map(item => [item.id, item]));
  assert.equal(byId.get('20.04').optional, false, 'Proxy/Reflect core activity is required');
  assert.equal(byId.get('20.05').optional, true, 'Proxy trade-off stays an extension');
  assert.equal(byId.get('09.09').optional, true, 'tagged templates are optional');
  assert.equal(byId.get('21.13').optional, true, 'EventTarget is optional');
  for (const id of ['04.14', '05.12', '05.13', '05.14', '05.15', '07.13', '10.09', '12.17', '12.18', '12.19', '12.20', '13.15']) {
    assert.equal(byId.get(id).optional, false, `${id} is core`);
  }
});

test('os primers cobrem os conceitos antecipados que a Fase 4 registrou', () => {
  const primers = read('course-src/prerequisite-primers.json');
  for (const id of ['04.01', '07.12', '12.15', '12.16', '15.01']) {
    assert(Array.isArray(primers[id]) && primers[id].length > 0, `${id} publishes a primer`);
  }
  const coverage = read('course-src/concept-coverage.json');
  assert.deepEqual(coverage['04.01'], ['arrays.pipeline', 'callbacks.basic']);
});
