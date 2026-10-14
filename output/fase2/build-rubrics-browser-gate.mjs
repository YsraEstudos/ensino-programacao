import fs from 'node:fs';
const catalog = JSON.parse(fs.readFileSync('public/course-catalog.json'));
const rows = ['09.08', '11.08', '12.08', '14.08', '23.08'].map(id => catalog.find(item => item.id === id));
const callback = async page => {
  const browser = page.context().browser();
  const results = [];
  for (const item of PAYLOAD) {
    if (!item.rubricFingerprint) throw new Error(item.id + ' missing rubric identity');
    const key = item.contentVersion > 1 ? `${item.id}@v${item.contentVersion}` : item.id;
    const marker = 'QA saved delivery ' + item.id;
    const files = Object.fromEntries(item.starterFiles.map((file, index) => [file.path, index === 0 ? file.content + '\n' + marker : file.content]));
    const draft = item.starterFiles.length === 1 ? files[item.starterFiles[0].path] : '__course_files__:' + JSON.stringify(files);
    const context = await browser.newContext();
    await context.addInitScript(({key, draft, count}) => {
      if (window !== window.top) return;
      if (!localStorage.getItem('devpath-local-preview-v1')) localStorage.setItem('devpath-local-preview-v1', JSON.stringify({
        exerciseDrafts: {[key]: draft}, exercisePredictions: {[key]: 'QA prediction registered before rubric update'},
        exerciseReflections: {[key]: 'QA reflection preserved from the earlier criteria'}, warmupCompleted: {[key]: true},
        exerciseEvidence: {[key]: {status: 'written', runResult: 'guided', source: 'rubric-declared', output: 'QA earlier declared attempt', rubric: Array.from({length: count}, (_, i) => i), rubricFingerprint: 'sha256:' + '0'.repeat(64)}}
      }));
    }, {key, draft, count: item.rubric.length});
    page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto('http://127.0.0.1:8765/devpath.html#/javascript/' + item.id);
      await page.getByRole('button', {name: 'Aprender este conceito', exact: true}).click();
      const boxes = page.locator(`[data-course-rubric="${item.id}"]`);
      await boxes.first().waitFor();
      if (await boxes.count() !== item.rubric.length) throw new Error(item.id + ' missing criteria');
      if (await page.locator(`[data-course-rubric="${item.id}"]:checked`).count()) throw new Error(item.id + ' old checks interpreted as new criteria');
      if (!(await page.locator(`[data-course-complete="${item.id}"]`).isDisabled())) throw new Error(item.id + ' stale rubric completion button looks ready');
      const displayed = await page.locator('.course-rubric-checks').textContent();
      if (item.rubric.some(criterion => !displayed.includes(criterion))) throw new Error(item.id + ' criterion not visible');
      const editor = page.locator(`[data-course-editor="${item.id}"]`).first();
      if (!(await editor.inputValue()).includes(marker)) throw new Error(item.id + ' old draft hidden');
      if (!(await page.locator(`[data-course-reflection="${item.id}"]`).inputValue()).includes('preserved')) throw new Error(item.id + ' old reflection hidden');
      const updated = await editor.inputValue() + '\nQA updated delivery';
      await editor.fill(updated);
      for (let index = 0; index < await boxes.count(); index++) await boxes.nth(index).check();
      await page.waitForFunction(({key, fingerprint}) => {
        const saved = JSON.parse(localStorage.getItem('devpath-local-preview-v1') || '{}');
        return saved.exerciseEvidence?.[key]?.rubricFingerprint === fingerprint && saved.exerciseDrafts?.[key]?.includes('QA updated delivery');
      }, {key, fingerprint: item.rubricFingerprint});
      await page.reload();
      await page.locator(`[data-course-rubric="${item.id}"]`).first().waitFor();
      if (await page.locator(`[data-course-rubric="${item.id}"]:checked`).count() !== item.rubric.length) throw new Error(item.id + ' current checks not restored');
      if (!(await page.locator(`[data-course-editor="${item.id}"]`).first().inputValue()).includes('QA updated delivery')) throw new Error(item.id + ' delivery did not survive reload');
      if (errors.length) throw new Error(item.id + ' page errors: ' + errors.join(';'));
      results.push({id: item.id, criteria: item.rubric.length, oldSameCountChecksIgnored: true, originalDraftReflectionVisible: true, currentChecksAndDeliveryRestored: true, pageErrors: errors});
    } finally {await context.close();}
  }
  return {results, note: 'UI persistence QA; this does not establish project correctness or independent mastery.'};
};
fs.writeFileSync('output/playwright/fase2/rubrics-browser-gate.js', '(' + callback.toString().replace('PAYLOAD', JSON.stringify(rows)) + ')');
console.log('Prepared five rubric persistence cases.');
