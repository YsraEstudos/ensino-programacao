import fs from 'node:fs';
const item = JSON.parse(fs.readFileSync('public/course-catalog.json')).find(item => item.id === '04.01');
const table = JSON.parse(fs.readFileSync('public/course-assessments.json'))[item.id].predictionTable;
const answers = JSON.parse(fs.readFileSync('course-src/predictions.json'))[item.id].cases[0];
const callback = async page => {
  const browser = page.context().browser();
  const {item, table, answers} = PAYLOAD;
  const key = (item.contentVersion || 1) > 1 ? `${item.id}@v${item.contentVersion}` : item.id;
  const cases = ['Minha resposta antiga: <img src=x> retorno e console são diferentes.', JSON.stringify({version: table.version + 1, answers})];
  const results = [];
  for (const saved of cases) {
    const context = await browser.newContext();
    await context.addInitScript(({saved, key}) => {
      if (window !== window.top) return;
      if (!localStorage.getItem('devpath-local-preview-v1')) localStorage.setItem('devpath-local-preview-v1', JSON.stringify({exercisePredictions: {[key]: saved}, warmupCompleted: {[key]: true}}));
    }, {saved, key});
    page = await context.newPage();
    try {
      await page.goto('http://127.0.0.1:8765/devpath.html#/javascript/' + item.id);
      await page.getByRole('button', {name: 'Aprender este conceito', exact: true}).click();
      await page.locator('.prediction-legacy').waitFor();
      if (!(await page.locator('.prediction-legacy').textContent()).includes(saved)) throw new Error('Old response hidden');
      if (await page.locator('.prediction-legacy img').count()) throw new Error('Old response parsed as HTML');
      if (await page.locator('[data-course-editor]').count()) throw new Error('Incompatible prediction opened practice');
      await page.locator('[data-guided-action="prediction-edit"]').click();
      const inputs = page.locator('[data-prediction-field]');
      await inputs.first().fill('x'.repeat(500));
      await page.locator('[data-course-first-response]').click();
      const old = await page.evaluate(key => JSON.parse(localStorage.getItem('devpath-local-preview-v1')).exercisePredictions[key], key);
      if (old !== saved) throw new Error('Oversize answer replaced old response');
      for (const field of table.fields) await page.locator(`[data-prediction-field="${field.id}"]`).fill(answers[field.id]);
      await page.locator('[data-course-first-response]').click();
      await page.locator('[data-course-editor]').first().waitFor();
      const replacement = await page.evaluate(key => JSON.parse(localStorage.getItem('devpath-local-preview-v1')).exercisePredictions[key], key);
      if (JSON.parse(replacement).version !== table.version) throw new Error('Wrong version persisted');
      await page.reload(); await page.locator('[data-course-editor]').first().waitFor();
      results.push({format: saved.startsWith('{') ? 'incompatible-version' : 'legacy-freeform', oldVisibleEscaped: true, oversizedReplacementRejected: true, explicitReplacementRestored: true});
    } finally {await context.close();}
  }
  return {results};
};
fs.writeFileSync('output/playwright/fase2/legacy-browser-gate.js', '(' + callback.toString().replace('PAYLOAD', JSON.stringify({item, table, answers})) + ')');
