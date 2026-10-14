import fs from 'node:fs';
const item = JSON.parse(fs.readFileSync('public/course-catalog.json')).find(row => row.id === '04.04');
const assessment = JSON.parse(fs.readFileSync('public/course-assessments.json'))[item.id];
const reference = fs.readFileSync('course-src/solutions/04.04/main.js', 'utf8');
const callback = async page => {
  const {item, assessment, reference} = PAYLOAD;
  const key = item.contentVersion > 1 ? `${item.id}@v${item.contentVersion}` : item.id;
  const context = await page.context().browser().newContext();
  await context.addInitScript(({key}) => {
    if (window !== window.top) return;
    if (!localStorage.getItem('devpath-local-preview-v1')) localStorage.setItem('devpath-local-preview-v1', JSON.stringify({
      exercisePredictions: {[key]: 'QA: média combina dois operandos e divide pelo número de valores'}, warmupCompleted: {[key]: true}
    }));
  }, {key});
  page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto('http://127.0.0.1:8765/devpath.html#/javascript/' + item.id);
    await page.getByRole('button', {name: 'Aprender este conceito', exact: true}).click();
    const editor = page.locator(`[data-course-editor="${item.id}"]`).first();
    await editor.fill(reference.replace('(a + b) / 2', 'a + b'));
    await page.locator(`[data-course-run="${item.id}"]`).click();
    await page.waitForFunction(id => document.querySelector(`[data-course-output="${id}"]`)?.textContent.includes('Primeira divergência'), item.id);
    const output = await page.locator(`[data-course-output="${item.id}"]`).textContent();
    for (const text of ['Entrada observada: [2,4]', 'Esperado: 3', 'Observado: 6', 'Próxima investigação:']) if (!output.includes(text)) throw new Error('Missing real feedback: ' + text + '\n' + output);
    const failed = await page.evaluate(key => JSON.parse(localStorage.getItem('devpath-local-preview-v1')).exerciseEvidence[key], key);
    if (failed.testsPassed) throw new Error('Semantic mismatch passed');
    await page.reload();
    await page.waitForFunction(id => document.querySelector(`[data-course-output="${id}"]`)?.textContent.includes('Entrada observada: [2,4]'), item.id);
    await page.locator(`[data-course-editor="${item.id}"]`).first().fill(reference);
    await page.locator(`[data-course-run="${item.id}"]`).click();
    await page.waitForFunction(key => JSON.parse(localStorage.getItem('devpath-local-preview-v1')).exerciseEvidence?.[key]?.testsPassed === true, key);
    const result = await page.evaluate(async ({item, assessment, reference}) => {
      const base = {activityId: item.id, contentVersion: item.contentVersion, assessmentVersion: assessment.version, files: [{path: 'main.js', content: reference}]};
      const annotated = await window.DevPathAssessment.canonicalFingerprint({...base, assessment});
      const plainAssessment = {...assessment, tests: assessment.tests.replace(/\/\*@case [^*]+\*\//g, '')};
      const plain = await window.DevPathAssessment.canonicalFingerprint({...base, assessment: plainAssessment});
      const changed = await window.DevPathAssessment.canonicalFingerprint({...base, assessment: {...plainAssessment, tests: plainAssessment.tests.replace('.toBe(3)', '.toBe(4)')}});
      return {annotationOnlyHashEqual: annotated === plain, semanticHashChanged: changed !== plain};
    }, {item, assessment, reference});
    if (!result.annotationOnlyHashEqual || !result.semanticHashChanged) throw new Error('Fingerprint identity regression: ' + JSON.stringify(result));
    if (errors.length) throw new Error(errors.join(';'));
    return {id: item.id, browserVersion: await context.browser().version(), firstFailure: failed.firstFailure, output, failedStored: true, feedbackReloadPreserved: true, correctedReferencePassed: true, ...result, pageErrors: errors};
  } finally {await context.close();}
};
fs.writeFileSync('output/playwright/fase2/feedback-browser-gate.js', '(' + callback.toString().replace('PAYLOAD', JSON.stringify({item, assessment, reference})) + ')');
