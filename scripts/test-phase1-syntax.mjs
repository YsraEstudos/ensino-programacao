import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import {JSDOM} from 'jsdom';
import * as esbuild from 'esbuild-wasm';
import {parse} from 'acorn';
import {setup as setupRunner} from './course-runner-harness.mjs';
import {withPublicDependencies} from './public-test-source.mjs';
import {stage03Contracts} from '../course-src/stage03-contract.mjs';
import {guidedPreparation} from '../course-src/guided-preparation.mjs';

const ids = ['03.10', '06.11'];
const catalog = JSON.parse(readFileSync('public/course-catalog.json', 'utf8'));
const assessments = JSON.parse(readFileSync('public/course-assessments.json', 'utf8'));
const sourceAssessments = JSON.parse(readFileSync('course-src/assessments.json', 'utf8'));
const learningMetadata = JSON.parse(readFileSync('course-src/learning-metadata.json', 'utf8'));
const compiled = JSON.parse(readFileSync('course-src/.generated/resolved_preview.json', 'utf8'));
const publicRoot = new URL('../public/', import.meta.url);

test('worked examples preserve punctuation inside inline code', () => {
  const item = catalog.find(item => item.id === '03.10');
  const preparation = guidedPreparation(item);
  assert.deepEqual(preparation.workedExample.steps, [
    'Para uma nota, `const faixa = pontos >= 60 ? "aprovar" : "revisar"` nomeia uma escolha simples.',
    'Para três estados, `if (pontos < 0) ... else if (pontos < 60) ... else ...` mostra a ordem das faixas sem aninhar ternários.',
  ]);
});
const moduleGraph = (() => {
  const w = {TextEncoder};
  w.window = w;
  vm.runInThisContext('(function(window){' + readFileSync('public/module-graph.js', 'utf8') + '})')(w);
  return w.DevPathModuleGraph;
})();

function solutionFiles(referenceDir) {
  const base = `course-src/${referenceDir}`;
  const walk = (dir, prefix = '') => readdirSync(dir, {withFileTypes: true}).flatMap(entry => entry.isDirectory()
    ? walk(`${dir}/${entry.name}`, `${prefix}${entry.name}/`)
    : entry.name.endsWith('.md') ? [] : [{path: `${prefix}${entry.name}`, content: readFileSync(`${dir}/${entry.name}`, 'utf8')}]);
  return walk(base);
}

function assessmentContext(env) {
  env.w.eval(readFileSync('public/course-node-runtime.js', 'utf8'));
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
  vm.runInNewContext(readFileSync('public/course-assessment.js', 'utf8'), w);
  return w;
}

async function settle() {
  for (let index = 0; index < 5; index += 1) await new Promise(resolve => setImmediate(resolve));
}

async function loadSite() {
  const dom = new JSDOM(readFileSync(new URL('devpath.html', publicRoot), 'utf8'), {
    url: 'http://localhost/devpath.html#/catalog', runScripts: 'outside-only',
  });
  const w = dom.window;
  w.fetch = async url => {
    const name = String(url).endsWith('/course-assessments.json') || String(url) === '/course-assessments.json'
      ? 'course-assessments.json' : 'course-catalog.json';
    return {ok: true, json: async () => JSON.parse(readFileSync(new URL(name, publicRoot), 'utf8'))};
  };
  for (const script of w.document.querySelectorAll('script[src]')) {
    const name = new URL(script.src).pathname.slice(1);
    w.eval(withPublicDependencies(readFileSync(new URL(name, publicRoot), 'utf8')));
  }
  await settle();
  return dom;
}

test('the two activities publish canonical IDs, executable contracts, and prerequisite edges', () => {
  assert.deepEqual(catalog.map(item => item.id), compiled.map(item => item.id));
  for (const [id, stage] of [['03.10', '03'], ['06.11', '06']]) {
    const item = catalog.find(entry => entry.id === id);
    assert(item, `${id} is published`);
    assert.equal(item.stage, stage);
    assert(item.preparation?.hints?.length >= 3, `${id} has generic guided preparation and hints`);
    assert(item.hints?.length >= 3, `${id} publishes hints to its generic renderer`);
    assert(item.edgeCases?.length >= 1, `${id} publishes learner-visible edge cases`);
    assert(item.autoTested, `${id} uses the browser assessment`);
    assert(assessments[id]?.tests?.trim(), `${id} has published executable tests`);
    assert(sourceAssessments[id]?.testPath && sourceAssessments[id]?.referenceDir, `${id} has canonical test and reference files`);
  }
  assert(learningMetadata['03.10'].requires.includes('03.04'));
  assert(learningMetadata['07.06'].requires.includes('03.10'));
  assert(learningMetadata['19.01'].requires.includes('03.10'));
  assert(learningMetadata['10.01'].requires.includes('06.11'));
  assert(learningMetadata['06.11'].requires.includes('06.10'));
  const ternary = catalog.find(item => item.id === '03.10');
  assert.match(ternary.explanation.mental_model, /ternário/i);
  assert.match(ternary.explanation.mental_model, /if/i);
  assert(ternary.rubric.some(line => /legibilidade|legível/i.test(line)), 'ternary criteria include readability');
  const optional = catalog.find(item => item.id === '06.11');
  for (const fallback of ['Visitante', '100', 'true', 'Sem mensagem']) {
    assert(optional.prompt.includes(fallback), `06.11 prompt states the ${fallback} default`);
  }
});

test('the dedicated Stage 03 bundle still contains exactly the original nine contracts', () => {
  const dom = new JSDOM('', {runScripts: 'outside-only'});
  try {
    dom.window.eval(readFileSync(new URL('stage03-preparation.js', publicRoot), 'utf8'));
    const published = JSON.parse(JSON.stringify(dom.window.DevPathStage03Preparation));
    assert.deepEqual(Object.keys(published).sort(), Object.keys(stage03Contracts).sort());
    assert.deepEqual(published, stage03Contracts);
    assert.deepEqual(Object.keys(published).sort(), Array.from({length: 9}, (_, index) => `03.${String(index + 1).padStart(2, '0')}`));
  } finally { dom.window.close(); }
});

test('the browser assessment fails each starter and passes each reference', async () => {
  const env = setupRunner();
  try {
    const evaluator = assessmentContext(env);
    for (const id of ids) {
      const item = catalog.find(entry => entry.id === id);
      const assessment = assessments[id];
      const reference = await evaluator.DevPathAssessment.run({
        item, assessment, files: solutionFiles(assessment.referenceDir), fingerprint: `phase1-syntax-reference-${id}`,
      });
      const starter = await evaluator.DevPathAssessment.run({
        item, assessment, files: item.starterFiles, fingerprint: `phase1-syntax-starter-${id}`,
      });
      assert.equal(reference.kind, 'passed', `${id} reference: ${reference.text}`);
      assert.equal(reference.tests.failed, 0, `${id} reference failed tests`);
      assert(reference.tests.total > 0, `${id} has no behavioral assertions`);
      assert.equal(starter.kind, 'failed', `${id} starter should fail: ${starter.text}`);
      assert.equal(starter.tests.failed, starter.tests.total, `${id} starter unexpectedly passed a behavioral check`);
    }
  } finally { env.close(); }
});

test('03.10 uses the generic site renderer and its dispatched input and hint handlers', async () => {
  const dom = await loadSite();
  try {
    const w = dom.window;
    w.location.hash = '#/javascript/03.10';
    await settle();
    const view = w.document.querySelector('#view');
    assert(view.querySelector('.s01-lesson'), 'generic guided renderer is active');
    assert.equal(view.querySelector('.s03-lesson'), null, 'dedicated Stage 03 renderer is bypassed for this ID');
    assert(view.querySelector('[data-course-first-response="03.10"]'));
    const prediction = view.querySelector('[data-first-response-input="03.10"]');
    prediction.value = 'A regra com duas alternativas fica curta; a regra com três fica mais clara em blocos.';
    view.querySelector('[data-course-first-response="03.10"]').click();
    await settle();
    assert(view.querySelector('[data-course-editor="03.10"]'));
    assert(view.querySelector('[data-course-run="03.10"]'));

    const editor = view.querySelector('[data-course-editor="03.10"]');
    editor.value = `${editor.value}\n// dispatch check`;
    editor.dispatchEvent(new w.Event('input', {bubbles: true}));
    const hint = view.querySelector('[data-guided-action="hint"]');
    hint.click();
    assert.match(view.querySelector('[data-guided-hints="03.10"]').textContent, /Dica 1:/);
    await new Promise(resolve => setTimeout(resolve, 550));
    const saved = JSON.parse(w.localStorage.getItem('devpath-local-preview-v1'));
    const key = '03.10';
    assert.match(saved.exerciseDrafts[key], /dispatch check/, 'generic input handler saves the 03.10 draft');
  } finally { dom.window.close(); }
});
