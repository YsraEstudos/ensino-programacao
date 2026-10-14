import fs from 'node:fs';
import path from 'node:path';
const catalog = JSON.parse(fs.readFileSync('public/course-catalog.json'));
const assessments = JSON.parse(fs.readFileSync('public/course-assessments.json'));
const before = new Set(JSON.parse(fs.readFileSync('output/fase1/catalog-before.json')).map(x => x.id));
function filesAt(dir, base = dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? filesAt(p, base) : e.name.endsWith('.md') ? [] : [{path: path.relative(base, p).replaceAll('\\', '/'), content: fs.readFileSync(p, 'utf8')}];
  });
}
const payload = catalog.filter(x => !before.has(x.id)).map(item => ({item, assessment: assessments[item.id], reference: filesAt(path.join('course-src', assessments[item.id].referenceDir))}));
const callback = async (page) => {
  const browserContext = await page.context().browser().newContext();
  page = await browserContext.newPage();
  const payload = PAYLOAD;
  const results = [];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const row of payload) {
    const id = row.item.id;
    await page.goto('http://127.0.0.1:8765/devpath.html#/javascript/' + id);
    await page.getByRole('button', {name: 'Aprender este conceito', exact: true}).waitFor({state: 'visible'});
    await page.getByRole('button', {name: 'Aprender este conceito', exact: true}).click();
    const prediction = page.locator(`[data-first-response-input="${id}"]`);
    await prediction.waitFor({state: 'visible'});
    await prediction.fill('Vou conferir o contrato, os tipos de entrada e cada caso de borda antes de implementar.');
    await page.locator(`[data-course-first-response="${id}"]`).click();
    const editor = page.locator(`[data-course-editor="${id}"]`).first();
    await editor.waitFor({state: 'visible'});
    const outcomes = await page.evaluate(async ({item, assessment, reference}) => {
      const run = files => window.DevPathAssessment.run({item, assessment, files, fingerprint: 'browser-phase1-' + item.id});
      let starter = await run(item.starterFiles);
      if (starter.kind === 'timeout') starter = await run(item.starterFiles);
      let solution = await run(reference);
      if (solution.kind === 'timeout') solution = await run(reference);
      return {starter: {kind: starter.kind, tests: starter.tests, text: starter.text}, reference: {kind: solution.kind, tests: solution.tests, text: solution.text}};
    }, row);
    if (outcomes.reference.kind !== 'passed' || !['failed', 'type-error'].includes(outcomes.starter.kind)) throw new Error(id + ': ' + JSON.stringify(outcomes));
    for (const file of row.reference) {
      const field = page.locator(`[data-course-editor="${id}"][data-course-file="${file.path}"]`);
      if (await field.count()) await field.fill(file.content);
    }
    await page.locator(`[data-course-run="${id}"]`).click();
    await page.waitForFunction(id => {
      const text = document.querySelector(`[data-course-output="${id}"]`)?.textContent || '';
      return text && !text.includes('Preparando avaliação local') && !text.includes('A saída aparecerá');
    }, id, {timeout: 30000});
    const uiOutput = await page.locator(`[data-course-output="${id}"]`).textContent();
    if (uiOutput.includes('Corrija o trabalho')) throw new Error(id + ' UI reference failed: ' + uiOutput);
    await page.locator(`[data-course-reflection="${id}"]`).fill('Conferi cada caso de borda no código e os testes mostram os resultados previstos pelo contrato.');
    const criteria = page.locator(`[data-course-rubric="${id}"]`);
    for (let n = 0; n < await criteria.count(); n++) await criteria.nth(n).check();
    const complete = page.locator(`[data-course-complete="${id}"]`);
    if (await complete.isDisabled()) throw new Error(id + ': completion unavailable after passing');
    await complete.click();
    await page.waitForFunction(id => JSON.parse(localStorage.getItem('devpath-local-preview-v1') || '{}').answers?.[id] === true, id);
    const draft = await editor.inputValue();
    await page.waitForTimeout(700);
    await page.reload();
    await editor.waitFor({state: 'visible'});
    const restored = await editor.inputValue();
    if (draft !== restored) throw new Error(id + ': draft lost on reload');
    const record = await page.evaluate(id => {
      const progress = JSON.parse(localStorage.getItem('devpath-local-preview-v1') || '{}');
      return {completed: progress.answers?.[id], state: progress.exerciseLearning?.[id]?.state};
    }, id);
    if (!record.completed || record.state !== 'verified') throw new Error(id + ': persisted evidence invalid: ' + JSON.stringify(record));
    results.push({id, ...outcomes, uiPassed: true, draftRestored: true, ...record});
  }
  if (errors.length) throw new Error('Page errors: ' + errors.join('; '));
  await browserContext.close();
  return {results, pageErrors: errors};
};
fs.writeFileSync('output/playwright/fase1/browser-gate.js', '(' + callback.toString().replace('PAYLOAD', JSON.stringify(payload)) + ')');
console.log(payload.map(r => r.item.id).join(', '));
