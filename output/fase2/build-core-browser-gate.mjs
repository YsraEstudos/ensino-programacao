import fs from 'node:fs';
import path from 'node:path';
const catalog = JSON.parse(fs.readFileSync('public/course-catalog.json'));
const assessments = JSON.parse(fs.readFileSync('public/course-assessments.json'));
const before = JSON.parse(fs.readFileSync('output/fase2/assessments-before.json'));
const predictions = JSON.parse(fs.readFileSync('course-src/predictions.json'));
function filesAt(dir, base = dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? filesAt(file, base) : entry.name.endsWith('.md') ? [] : [{path: path.relative(base, file).replaceAll('\\', '/'), content: fs.readFileSync(file, 'utf8')}];
  });
}
const payload = catalog.filter(item => Number(item.stage) >= 4 && Number(item.stage) <= 10 && !before[item.id] && assessments[item.id].environment === 'javascript').map(item => ({item, assessment: assessments[item.id], reference: filesAt(path.join('course-src', assessments[item.id].referenceDir)), prediction: predictions[item.id]?.cases?.[0]}));
const callback = async (page) => {
  const context = await page.context().browser().newContext();
  page = await context.newPage();
  const rows = PAYLOAD;
  const errors = [], results = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    for (const row of rows) {
      const id = row.item.id;
      await page.goto('http://127.0.0.1:8765/devpath.html#/javascript/' + id);
      await page.getByRole('button', {name: 'Aprender este conceito', exact: true}).click();
      if (row.assessment.predictionTable) {
        for (const field of row.assessment.predictionTable.fields) await page.locator(`[data-prediction-field="${field.id}"]`).fill(row.prediction[field.id]);
      } else {
        await page.locator(`[data-first-response-input="${id}"]`).fill('QA: vou seguir as entradas, saídas e bordas publicadas para esta implementação.');
      }
      await page.locator(`[data-course-first-response="${id}"]`).click();
      const editor = page.locator(`[data-course-editor="${id}"]`).first();
      await editor.waitFor();
      const outcomes = await page.evaluate(async ({item, assessment, reference}) => {
        const run = files => window.DevPathAssessment.run({item, assessment, files, fingerprint: 'browser-phase2-core-' + item.id});
        const starter = await run(item.starterFiles), correct = await run(reference);
        return {starter: {kind: starter.kind, tests: starter.tests, text: starter.text}, reference: {kind: correct.kind, tests: correct.tests, text: correct.text}};
      }, row);
      if (outcomes.reference.kind !== 'passed' || !outcomes.reference.tests?.total) throw new Error(id + ' reference: ' + JSON.stringify(outcomes.reference));
      const expectStarterFailure = !['PREDICT', 'TRACE'].includes(row.item.kind) && id !== '04.10';
      if (expectStarterFailure && outcomes.starter.kind !== 'failed') throw new Error(id + ' starter: ' + JSON.stringify(outcomes.starter));
      for (const file of row.reference) {
        const field = page.locator(`[data-course-editor="${id}"][data-course-file="${file.path}"]`);
        if (await field.count()) await field.fill(file.content);
      }
      await page.locator(`[data-course-run="${id}"]`).click();
      await page.waitForFunction(id => {
        const text = document.querySelector(`[data-course-output="${id}"]`)?.textContent || '';
        return text && !text.includes('Preparando avaliação local') && !text.includes('A saída aparecerá');
      }, id, {timeout: 30000});
      const output = await page.locator(`[data-course-output="${id}"]`).textContent();
      if (output.includes('Corrija o trabalho')) throw new Error(id + ' UI reference: ' + output);
      if (row.assessment.predictionTable && !output.includes(`${row.assessment.predictionTable.fields.length} coincidiram`)) throw new Error(id + ' prediction: ' + output);
      await page.locator(`[data-course-reflection="${id}"]`).fill('QA: conferi os resultados e os casos de borda com o contrato da atividade.');
      const checks = page.locator(`[data-course-rubric="${id}"]`);
      for (let index = 0; index < await checks.count(); index++) await checks.nth(index).check();
      const complete = page.locator(`[data-course-complete="${id}"]`);
      if (await complete.isDisabled()) throw new Error(id + ' completion remains disabled');
      await complete.click();
      await page.waitForFunction(id => JSON.parse(localStorage.getItem('devpath-local-preview-v1') || '{}').answers?.[id] === true, id);
      const draft = await editor.inputValue();
      await page.waitForTimeout(700);
      await page.reload(); await editor.waitFor();
      if (draft !== await editor.inputValue()) throw new Error(id + ' draft lost');
      const saved = await page.evaluate(id => {
        const progress = JSON.parse(localStorage.getItem('devpath-local-preview-v1') || '{}');
        return {completed: progress.answers?.[id], state: progress.exerciseLearning?.[id]?.state, prediction: progress.exercisePredictions?.[id]};
      }, id);
      if (!saved.completed || saved.state !== 'verified') throw new Error(id + ' learning evidence: ' + JSON.stringify(saved));
      results.push({id, ...outcomes, predictionCompared: Boolean(row.prediction), draftRestored: true, ...saved});
    }
    if (errors.length) throw new Error(errors.join('; '));
    return {results, pageErrors: errors, origin: 'QA, not a learner study sample'};
  } finally { await context.close(); }
};
fs.mkdirSync('output/playwright/fase2', {recursive: true});
fs.writeFileSync('output/playwright/fase2/core-browser-gate.js', '(' + callback.toString().replace('PAYLOAD', JSON.stringify(payload)) + ')');
console.log(payload.map(row => row.item.id).join(', '));
