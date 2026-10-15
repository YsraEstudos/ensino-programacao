import assert from 'node:assert/strict';
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import * as esbuild from 'esbuild-wasm';
import {parse} from 'acorn';
import {setup} from './course-runner-harness.mjs';

const readJson = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const catalog = readJson('course-src/.generated/resolved_preview.json');
const assessments = readJson('course-src/assessments.json');
const publishedAssessments = readJson('public/course-assessments.json');
const starters = readJson('course-src/starters/manifest.json');
const initialCatalog = readJson('output/fase2/catalog-before.json');
const initialAssessments = readJson('output/fase2/assessments-before.json');
const predictionsPath = new URL('../course-src/predictions.json', import.meta.url);
const predictions = existsSync(predictionsPath) ? JSON.parse(readFileSync(predictionsPath, 'utf8')) : {};
const ids = catalog.filter(item => Number(item.stage) >= 4 && Number(item.stage) <= 10).map(item => item.id);
const target = new Set(ids);
const initialIds = initialCatalog.filter(item => Number(item.stage) >= 4 && Number(item.stage) <= 10).map(item => item.id);
const initiallyMissing = initialIds.filter(id => !initialAssessments[id]);
const missing = ids.filter(id => !assessments[id]);

assert.equal(ids.length, 84, 'the effective compiled 04–10 catalog includes the three earlier additions, two Fase 3 Git activities, eight Fase 4 additions (04.14, 05.12–05.15, 07.13, 09.09, 10.09) and five Fase 5 additions (05.16, 06.12, 07.14, 09.10, 10.10)');
assert.equal(initiallyMissing.length, 30, `expected initial assessment gap: ${initiallyMissing.join(', ')}`);
assert.equal(missing.length, 0, `04–10 activities without assessment: ${missing.join(', ')}`);

const expectedBehaviors = {
  '04.01': ['preverRetornos'],
  '04.03': ['exibir'],
  '04.08': ['custoPeso', 'custoDistancia', 'frete'],
  '04.10': ['totalPedido'],
  '05.01': ['observarReferencias'],
  '05.03': ['slug'],
  '06.01': ['observarAliasing'],
  '06.02': ['observarReferencias'],
  '06.03': ['normalizar'],
  '07.03': ['ranking'],
  '07.06': ['resumirPorCategoria'],
  '08.01': ['analises'],
  '08.02': ['somar'],
  '08.07': ['tracarBfs'],
  '09.01': ['tracarEscopo'],
  '09.02': ['criarConta'],
  '09.04': ['criarContadores'],
  '09.05': ['criarHandlers'],
  '10.01': ['compararThis'],
  '10.02': ['Cofre'],
  '10.06': ['criarPersonagem'],
  '10.07': ['criarNotificador'],
};
assert.equal(Object.keys(expectedBehaviors).length, 22, 'all runnable additions have protected behavior suites');
for (const [id, exportsNeeded] of Object.entries(expectedBehaviors)) {
  assert(assessments[id]?.checks?.includes('behavior'), `${id} must publish executable behavior checks`);
  assert(assessments[id]?.referenceDir, `${id} must have a protected reference`);
  const testPath = assessments[id].testPath;
  assert(testPath && readdirSync(new URL('../course-src/tests/', import.meta.url)).includes(testPath.split('/').at(-1)), `${id} must have its canonical test file`);
  const testSource = readFileSync(new URL(`../course-src/${testPath}`, import.meta.url), 'utf8');
  for (const name of exportsNeeded) assert(testSource.includes(name), `${id} tests must call ${name}`);
}
assert(assessments['04.10'].rubric?.length >= 2, '04.10 must review internal naming with human criteria in addition to checking behavior');
assert.equal(assessments['04.10'].environment, 'javascript', '04.10 behavior is executable; only its naming criterion is human-reviewed');
assert(assessments['10.07'].rubric?.length >= 2, '10.07 must assess the transfer rationale with human criteria in addition to runnable behavior');
assert.equal(assessments['10.07'].environment, 'javascript', '10.07 transfer behavior is executable; the rationale remains human-reviewed');
assert.equal(assessments['05.11']?.environment, 'rubric', '05.11 remains a human-reviewed comparison');
assert(assessments['05.11']?.rubric?.length >= 2, '05.11 needs concrete comparison criteria');

for (const id of target) {
  const record = catalog.find(item => item.id === id);
  const assessment = assessments[id];
  if (['PREDICT', 'TRACE'].includes(record.kind)) {
    assert(assessment?.predictionTable, `${id} needs a structured prediction table`);
    assert(predictions[id]?.cases?.length, `${id} needs protected expected observations`);
    assert.equal(assessment.predictionTable.version, predictions[id].version, `${id} prediction version must match the protected data`);
  }
  if (record.kind === 'PARSONS') {
    assert(assessment?.checks?.includes('behavior'), `${id} reconstruction needs a behavioral result check`);
    const testPath = assessment.testPath;
    assert(testPath, `${id} reconstruction needs a protected test file`);
    const testSource = readFileSync(new URL(`../course-src/${testPath}`, import.meta.url), 'utf8');
    assert(testSource.includes("from './main.js'") || testSource.includes('from "./main.js"'), `${id} suite must import the learner's assembled program`);
  }
}

const initialProseIds = initialCatalog.filter(item => Number(item.stage) >= 4 && Number(item.stage) <= 10 && item.starterFiles?.every(file => file.path === 'material.md')).map(item => item.id);
assert.equal(initialProseIds.length, 17, `expected the initial 17 prose-only starters, got ${initialProseIds.length}`);
for (const id of initialProseIds) {
  assert(starters[id]?.files?.some(path => /\.(?:m?js|ts)$/.test(path)), `${id} must materialize the described runnable code in starters/`);
}

assert.equal(predictions.version, 1, 'protected prediction manifest must be versioned');
for (const id of ['04.10', '05.11', '10.07']) assert(target.has(id), `${id} from the compiled catalog must be included`);

const providerPath = new URL('../public/structured-predictions.js', import.meta.url);
assert(existsSync(providerPath), 'the structured prediction provider must exist');
const providerWindow = {DevPathTeachingUtils: {escapeHTML: value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]))}};
vm.runInNewContext(readFileSync(providerPath, 'utf8'), {window: providerWindow});
const provider = providerWindow.DevPathStructuredPredictions;
const table = {version: 1, instructions: 'Preveja antes de executar.', fields: [{id: 'value', label: 'Saída <esperada>'}, {id: 'nested.ok', label: 'Estado'}]};
const saved = provider.serialize(table, {value: '2', 'nested.ok': 'true'});
assert.deepEqual(JSON.parse(saved), {version: 1, answers: {value: '2', 'nested.ok': 'true'}});
const rendered = provider.renderForm(table, saved);
assert.match(rendered, /data-structured-prediction="/);
assert.match(rendered, /Saída &lt;esperada&gt;/, 'table labels must be escaped');
const compared = provider.compare(table, saved, '2\n{"value":2,"nested":{"ok":true}}');
assert.equal(compared.matched, 2, 'saved structured answers must be compared with parsed execution output');
assert.equal(compared.total, 2);
  assert.equal(compared.complete, true);
  const partial = provider.compare(table, provider.serialize(table, {value: '2'}), '{"value":2,"nested":{"ok":true}}');
  assert.equal(partial.complete, false, 'partial prediction is described as incomplete, not scored as a full response');
  assert.equal(partial.answered, 1);
const mismatch = provider.compare(table, saved, '{"value":3,"nested":{"ok":false}}');
assert.equal(mismatch.matched, 0, 'mismatches must remain visible instead of becoming grades');
const arrayPath = provider.compare({version: 1, fields: [{id: 'growth', path: '[*].growth'}]}, JSON.stringify({version: 1, answers: {growth: '["O(1)","O(n)"]'}}), '[{"growth":"O(1)"},{"growth":"O(n)"}]');
assert.equal(arrayPath.matched, 1, 'prediction comparison supports projections from observable arrays');
const legacyText = 'Minha previsão antiga <b>livre</b>';
assert.equal(provider.parse(legacyText, table).state, 'legacy');
assert.equal(provider.compare(table, legacyText, '{"value":2,"nested":{"ok":true}}').compatible, false, 'legacy text is never treated as a structured answer');
assert.match(provider.renderSaved(table, legacyText), /Minha previsão antiga &lt;b&gt;livre&lt;\/b&gt;/, 'legacy freeform response is preserved and escaped');
assert.match(provider.renderForm(table, legacyText), /data-prediction-field="value"/, 'legacy input remains available until explicit replacement');
const oldVersion = JSON.stringify({version: 0, answers: {value: '2'}});
assert.equal(provider.parse(oldVersion, table).state, 'version-mismatch');
assert.equal(provider.compare(table, oldVersion, '{"value":2,"nested":{"ok":true}}').compatible, false, 'old structured answers are not silently reinterpreted');
assert.match(provider.renderSaved(table, oldVersion), /versão 0/, 'version mismatch is visible');

const {withPublicDependencies} = await import('./public-test-source.mjs');
const runner = setup();
try {
  const w = runner.w;
  w.eval(readFileSync(new URL('../public/course-node-runtime.js', import.meta.url), 'utf8'));
  const graphWindow = {TextEncoder}; graphWindow.window = graphWindow;
  vm.runInThisContext('(function(window){' + readFileSync(new URL('../public/module-graph.js', import.meta.url), 'utf8') + '})')(graphWindow);
  const graphApi = graphWindow.DevPathModuleGraph;
  const assessmentWindow = {
    TextEncoder, DevPathNodeRuntime: w.DevPathNodeRuntime,
    DevPathModuleGraph: {buildModuleGraph: input => graphApi.buildModuleGraph(input, {build: esbuild.build, parse, transform: esbuild.transform, runtime: input.runtime})},
    DevPathCourseRunner: {run: (code, done, options) => w.DevPathCourseRunner.run(code, done, options)},
  };
  assessmentWindow.window = assessmentWindow;
  vm.runInNewContext(withPublicDependencies(readFileSync(new URL('../public/course-assessment.js', import.meta.url), 'utf8')), assessmentWindow);
  const walkFiles = (dir, prefix = '') => readdirSync(dir, {withFileTypes: true}).flatMap(entry => entry.isDirectory()
    ? walkFiles(`${dir}/${entry.name}`, `${prefix}${entry.name}/`)
    : [{path: `${prefix}${entry.name}`, content: readFileSync(`${dir}/${entry.name}`, 'utf8')}]);
  for (const id of Object.keys(expectedBehaviors)) {
    const assessment = publishedAssessments[id];
    if (!target.has(id) || !assessment.checks?.includes('behavior')) continue;
    const item = JSON.parse(readFileSync(new URL('../public/course-catalog.json', import.meta.url), 'utf8')).find(entry => entry.id === id);
    const referenceFiles = walkFiles(fileURLToPath(new URL(`../course-src/${assessment.referenceDir}`, import.meta.url)));
    const reference = await assessmentWindow.DevPathAssessment.run({item, assessment, files: referenceFiles, fingerprint: `phase2-reference-${id}`});
    assert.equal(reference.kind, 'passed', `${id} protected reference should pass: ${reference.text} ${JSON.stringify(reference.tests)}`);
    assert(reference.tests?.total > 0, `${id} must execute at least one protected assertion`);
    if (assessment.predictionTable) {
      const expected = predictions[id].cases[0];
      const serialized = provider.serialize(assessment.predictionTable, expected);
      assert(serialized.length <= 400, `${id} canonical prediction fits the persisted response limit`);
      const comparison = provider.compare(assessment.predictionTable, serialized, reference.text);
      assert.equal(comparison.matched, comparison.total, `${id} prediction table must match observations logged by the protected reference: ${JSON.stringify(comparison)}; output=${reference.text}`);
    }
    if (!['PREDICT', 'TRACE'].includes(item.kind) && id !== '04.10') {
      const starter = await assessmentWindow.DevPathAssessment.run({item, assessment, files: item.starterFiles, fingerprint: `phase2-starter-${id}`});
      assert.equal(starter.kind, 'failed', `${id} starter should fail the protected behavior suite: ${starter.text}`);
      assert(starter.tests?.failed > 0, `${id} starter must fail at least one protected case`);
    } else if (id === '04.10') {
      const starter = await assessmentWindow.DevPathAssessment.run({item, assessment, files: item.starterFiles, fingerprint: `phase2-starter-${id}`});
      assert.equal(starter.kind, 'passed', '04.10 intentionally passes regression tests: renaming is judged by its human rubric, not inferred from syntax or behavioral change');
    }
  }
} finally {
  runner.close();
}

console.log(`Task 1 core contracts passed for ${ids.length} activities (${initialProseIds.length} materialized starters, ${initiallyMissing.length} assessments added).`);
