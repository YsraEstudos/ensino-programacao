import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import * as esbuild from 'esbuild-wasm';
import {parse} from 'acorn';
import {setup} from './course-runner-harness.mjs';

const ids = ['04.11', '04.12', '04.13'];
const catalog = JSON.parse(readFileSync('public/course-catalog.json', 'utf8'));
const assessments = JSON.parse(readFileSync('public/course-assessments.json', 'utf8'));
const sourceAssessments = JSON.parse(readFileSync('course-src/assessments.json', 'utf8'));
const learningMetadata = JSON.parse(readFileSync('course-src/learning-metadata.json', 'utf8'));
const compiled = JSON.parse(readFileSync('course-src/.generated/resolved_preview.json', 'utf8'));
const moduleGraph = (() => {
  const w = {TextEncoder};
  w.window = w;
  vm.runInThisContext('(function(window){' + readFileSync('public/module-graph.js', 'utf8') + '})')(w);
  return w.DevPathModuleGraph;
})();
const assessmentSource = readFileSync('public/course-assessment.js', 'utf8');

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
  vm.runInNewContext(assessmentSource, w);
  return w;
}

test('Falhas previsíveis mantém IDs, arestas e avaliação na fonte canônica', () => {
  assert.deepEqual(catalog.map(item => item.id), compiled.map(item => item.id));
  for (const id of ids) {
    const item = catalog.find(entry => entry.id === id);
    assert(item, `${id} is published`);
    assert(item.starterFiles.some(file => file.path === 'main.js' && /\bexport function\b/.test(file.content)), `${id} exposes its evaluated function`);
    assert(assessments[id]?.tests, `${id} publishes its executable assessment`);
    assert(sourceAssessments[id]?.testPath && sourceAssessments[id]?.referenceDir, `${id} has a canonical test and reference`);
  }
  const expected = {
    '04.08': ['04.07'], '04.09': ['04.07'], '04.10': ['04.07'],
    '04.11': ['04.07'], '04.12': ['04.11'], '04.13': ['04.12'],
    '05.07': ['04.11'], '12.02': ['04.11', '04.12'], '12.05': ['04.12'],
    '08.02': ['03.01', '05.01', '06.01'],
  };
  for (const [id, requires] of Object.entries(expected)) assert.deepEqual(learningMetadata[id].requires, requires, `${id} prerequisites`);
});

test('o avaliador publicado reprova cada starter e aprova cada referência', async () => {
  const env = setup();
  try {
    const evaluator = assessmentContext(env);
    for (const id of ids) {
      const item = catalog.find(entry => entry.id === id);
      const assessment = assessments[id];
      const reference = await evaluator.DevPathAssessment.run({
        item, assessment, files: solutionFiles(assessment.referenceDir), fingerprint: `phase1-reference-${id}`,
      });
      const starter = await evaluator.DevPathAssessment.run({
        item, assessment, files: item.starterFiles, fingerprint: `phase1-starter-${id}`,
      });
      assert.equal(reference.kind, 'passed', `${id} reference: ${reference.text}`);
      assert.equal(reference.tests.failed, 0, `${id} reference failed tests`);
      assert(reference.tests.total > 0, `${id} has no behavioral assertions`);
      assert.equal(starter.kind, 'failed', `${id} starter should fail behavior checks: ${starter.text}`);
      assert.equal(starter.tests.failed, starter.tests.total, `${id} starter unexpectedly passed a behavior check`);
    }
  } finally {
    env.close();
  }
});
