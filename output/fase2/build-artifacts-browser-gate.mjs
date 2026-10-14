import fs from 'node:fs';
import path from 'node:path';
const catalog = JSON.parse(fs.readFileSync('public/course-catalog.json'));
const assessments = JSON.parse(fs.readFileSync('public/course-assessments.json'));
const before = JSON.parse(fs.readFileSync('output/fase2/assessments-before.json'));
function filesAt(dir, base = dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? filesAt(file, base) : entry.name.endsWith('.md') ? [] : [{path: path.relative(base, file).replaceAll('\\', '/'), content: fs.readFileSync(file, 'utf8')}];
  });
}
const payload = catalog.filter(item => Number(item.stage) >= 11 && Number(item.stage) <= 23 && ['rubric', 'local'].includes(before[item.id]?.environment) && !['rubric', 'local'].includes(assessments[item.id]?.environment)).map(item => ({item, assessment: assessments[item.id], reference: filesAt(path.join('course-src', assessments[item.id].referenceDir))}));
const callback = async page => {
  const context = await page.context().browser().newContext();
  page = await context.newPage();
  const rows = PAYLOAD;
  const results = [], errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto('http://127.0.0.1:8765/devpath.html');
    await page.waitForFunction(() => !!window.DevPathAssessment);
    for (const row of rows) {
      const result = await page.evaluate(async ({item, assessment, reference}) => {
        const run = files => window.DevPathAssessment.run({item, assessment, files, fingerprint: 'browser-phase2-artifacts-' + item.id});
        let starter = await run(item.starterFiles), correct = await run(reference);
        if (correct.kind === 'timeout') correct = await run(reference);
        const mutants = [];
        for (const mutant of assessment.typeContractMutants || []) {
          const replacements = new Map(mutant.files.map(file => [file.path, file]));
          const files = reference.map(file => replacements.get(file.path) || file).concat(mutant.files.filter(file => !reference.some(original => original.path === file.path)));
          const value = await run(files);
          mutants.push({id: mutant.id, kind: value.kind, text: value.text});
        }
        return {starter: {kind: starter.kind, tests: starter.tests, text: starter.text}, reference: {kind: correct.kind, tests: correct.tests, text: correct.text}, mutants};
      }, row);
      if (result.reference.kind !== 'passed') throw new Error(row.item.id + ' reference failed: ' + JSON.stringify(result.reference));
      if (['PARSONS','FADED','MAKE','DEBUG','MODIFY','TRANSFER'].includes(row.item.kind) && !['failed','type-error'].includes(result.starter.kind)) throw new Error(row.item.id + ' starter did not fail: ' + JSON.stringify(result.starter));
      if (result.mutants.some(mutant => !['failed','type-error'].includes(mutant.kind))) throw new Error(row.item.id + ' insensitive type contract: ' + JSON.stringify(result.mutants));
      results.push({id: row.item.id, environment: row.assessment.environment, kind: row.item.kind, ...result});
    }
    if (errors.length) throw new Error('Page errors: ' + errors.join('; '));
    return {results, pageErrors: errors, note: 'Actual submitted-file assessment in Chromium; correct TRACE/COMPARE artifacts may already pass.'};
  } finally {await context.close();}
};
fs.mkdirSync('output/playwright/fase2', {recursive: true});
fs.writeFileSync('output/playwright/fase2/artifacts-browser-gate.js', '(' + callback.toString().replace('PAYLOAD', JSON.stringify(payload)) + ')');
console.log(payload.map(row => row.item.id + ':' + row.assessment.environment).join(', '));
