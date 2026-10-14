import fs from 'node:fs';
const item = JSON.parse(fs.readFileSync('public/course-catalog.json')).find(row => row.id === '04.01');
const callback = async page => {
  const context = await page.context().browser().newContext();
  const item = PAYLOAD;
  const key = item.id + '@v' + item.contentVersion;
  await context.addInitScript(({id, key}) => {
    if (window !== window.top) return;
    if (!localStorage.getItem('devpath-local-preview-v1')) localStorage.setItem('devpath-local-preview-v1', JSON.stringify({
      exerciseDrafts: {[id]: '<script>historical draft</script>', [key]: 'QA current draft'},
      exercisePredictions: {[id]: 'historical prediction <img src=x>'},
      exerciseReflections: {[id]: 'historical reflection', [key]: 'QA current reflection'}
    }));
  }, {id: item.id, key});
  page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto('http://127.0.0.1:8765/devpath.html#/javascript/' + item.id);
    await page.getByRole('button', {name: 'Aprender este conceito', exact: true}).click();
    const panel = page.locator('.course-prior-attempts');
    await panel.locator('summary').click();
    if (!(await panel.textContent()).includes('historical draft')) throw new Error('Old draft hidden');
    if (!(await panel.textContent()).includes('historical prediction')) throw new Error('Old prediction hidden');
    if (!(await panel.textContent()).includes('historical reflection')) throw new Error('Old reflection hidden');
    if (await panel.locator('script,img,textarea').count()) throw new Error('Prior record parsed as active HTML or editable');
    await page.getByRole('button', {name: 'Começar nova tentativa de memória sem ajuda', exact: true}).click();
    await page.waitForFunction(id => JSON.parse(localStorage.getItem('devpath-local-preview-v1')).exerciseLearning?.[id]?.assisted === false, item.id);
    if (await panel.isVisible()) throw new Error('Prior answers leaked into independent recall');
    await page.locator('[data-learning-help-target="course-prior-attempts"]').click();
    await page.waitForFunction(id => JSON.parse(localStorage.getItem('devpath-local-preview-v1')).exerciseLearning?.[id]?.assisted === true, item.id);
    await panel.waitFor({state: 'visible'});
    await page.reload();
    await page.locator('.course-prior-attempts').waitFor({state: 'visible'});
    const saved = await page.evaluate(({id, key}) => {
      const state = JSON.parse(localStorage.getItem('devpath-local-preview-v1'));
      return {oldDraft: state.exerciseDrafts[id], currentDraft: state.exerciseDrafts[key], oldPrediction: state.exercisePredictions[id], oldReflection: state.exerciseReflections[id], currentReflection: state.exerciseReflections[key], assisted: state.exerciseLearning[id].assisted};
    }, {id: item.id, key});
    if (saved.oldDraft !== '<script>historical draft</script>' || saved.currentDraft !== 'QA current draft' || saved.currentReflection !== 'QA current reflection') throw new Error('History migrated or overwritten');
    if (errors.length) throw new Error(errors.join(';'));
    return {id: item.id, historicalFieldsReadableEscaped: true, independentRecallHiddenUntilHelp: true, helpRecorded: saved.assisted, reloadPreservedSeparateKeys: true, saved, pageErrors: errors};
  } finally {await context.close();}
};
fs.writeFileSync('output/playwright/fase2/prior-browser-gate.js', '(' + callback.toString().replace('PAYLOAD', JSON.stringify(item)) + ')');
