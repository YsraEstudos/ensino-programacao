import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const root = new URL('../', import.meta.url);
const readJson = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const sourceCatalog = readJson('course-src/.generated/resolved_preview.json');
const initialCatalog = readJson('output/fase2/catalog-before.json');
const assessmentsBefore = readJson('output/fase2/assessments-before.json');
const assessments = readJson('course-src/assessments.json');
const publishedAssessments = readJson('public/course-assessments.json');
const starters = readJson('course-src/starters/manifest.json');
const catalog = readJson('public/course-catalog.json');

const sourceIds = initialCatalog.filter(item => Number(item.stage) >= 11 && Number(item.stage) <= 14 && item.starterFiles?.length === 1 && item.starterFiles[0].path === 'material.md').map(item => item.id).sort();
assert.equal(sourceIds.length, 19, `baseline has 19 prose starters: ${sourceIds.join(', ')}`);
for (const id of sourceIds) {
  const item = catalog.find(entry => entry.id === id);
  assert(item, `${id} remains in public catalog`);
  assert(starters[id], `${id} is materialized in source starter manifest`);
  assert(item.starterFiles?.length > 0, `${id} publishes starter content`);
  assert(starters[id].files.length > 0, `${id} has canonical starter files`);
  for (const file of item.starterFiles) assert(file.content?.trim().length >= (file.path.endsWith('.md') ? 70 : 1), `${id}/${file.path} contains usable context or code`);
}

const jsConvertedIds = ['11.01','11.02','11.11','11.14','12.02','12.11','12.14','13.02','14.02'];
const tsConvertedIds = ['16.01','17.02','18.02','19.01','19.02','19.06'];
const convertedIds = [...jsConvertedIds, ...tsConvertedIds];
assert.equal(convertedIds.length, 15);
for (const id of jsConvertedIds) {
  const assessment = assessments[id];
  assert(assessment && !['rubric','local'].includes(assessment.environment), id + ' executable environment');
  assert(assessment.version > (assessmentsBefore[id]?.version || 0), id + ' version increases');
  assert(assessment.referenceDir, id + ' protected reference');
  assert(assessment.checks.includes('behavior') && !assessment.checks.includes('mutation'), id + ' tests submitted behavior without learner-authored mutants');
  assert(assessment.testPath && existsSync(new URL('course-src/' + assessment.testPath, root)), id + ' protected behavior test');
  const testSource = readFileSync(new URL('course-src/' + assessment.testPath, root), 'utf8');
  assert(/from\s+['"][^'"]+['"]/.test(testSource), id + ' tests import submitted work');
  assert(publishedAssessments[id]?.checks?.includes('behavior'), id + ' behavior check published');
}
for (const id of tsConvertedIds) {
  const assessment=assessments[id];
  assert(assessment?.environment==='typescript' && assessment.checks.includes('types'), id + ' protected type checks');
  assert(!assessment.studentSuiteKind && !assessment.studentSuite, id + ' no learner-authored type suite');
  assert(assessment.contractTypeFiles?.length, id + ' protected assertions');
  if(id!=='18.02') assert(assessment.typeContractMutants?.length && assessment.checks.includes('mutation'), id + ' internal control mutants run as protected contracts');
  else {
    assert(!assessment.checks.includes('mutation') && assessment.checks.includes('behavior') && assessment.testPath==='tests/18.02.test.js' && assessment.behaviorTestPath==='__devpath_protected_behavior__.js', '18.02 keeps the protected suite at the runner synthetic root');
    const canonicalTest=readFileSync(new URL('course-src/tests/18.02.test.js',root),'utf8');
    assert.match(canonicalTest, /from '\.\/patch\.js'/, 'the test source uses the synthetic-root-relative import expected by the publisher');
    assert.equal(publishedAssessments[id]?.tests,canonicalTest, 'the published protected suite exactly matches canonical source');
  }
  const contract=assessment.contractTypeFiles[0];
  assert(existsSync(new URL('course-src/' + contract.path,root)) && contract.content.trim(), id + ' protected contract source');
  assert(publishedAssessments[id]?.contractTypeFiles?.length, id + ' publishes protected contract assertions');
  if(id!=='18.02') assert(publishedAssessments[id]?.typeContractMutants?.length, id + ' publishes internal control mutants');
}

for (const id of ['11.02','12.02','13.02','14.02']) {
  const assessment=assessments[id],entry=assessment.entryPath;
  const starter=readFileSync(new URL('course-src/starters/'+id+'/'+entry,root),'utf8');
  const reference=readFileSync(new URL('course-src/'+assessment.referenceDir+'/'+entry,root),'utf8');
  assert.notEqual(starter,reference,id+' Parsons starter is distinct from its passing reference');
}
const retained = Object.keys(assessmentsBefore).filter(id => /^\d{2}\./.test(id) && Number(id.slice(0,2)) >= 11 && Number(id.slice(0,2)) <= 23 && ['rubric','local'].includes(assessmentsBefore[id].environment));
assert.equal(retained.length, 59, `baseline rubric/local decision set has 59 activities, found ${retained.length}`);
const converted = new Set(convertedIds);
const declared = retained.filter(id => !converted.has(id));
assert.equal(declared.length, 44);
for (const id of declared) {
  const assessment = assessments[id];
  assert(['rubric','local'].includes(assessment?.environment), `${id} remains declared by nature`);
  assert(assessment.evidenceNote?.trim(), `${id} exposes the declared-evidence label`);
}

const bundle = catalog.find(item => item.id === '14.12');
assert(bundle?.readOnlyFiles?.length >= 5, '14.12 includes immutable source/build evidence files');
assert(bundle.readOnlyFiles.every(file => file.label?.trim() && file.path?.trim() && file.content?.trim()), '14.12 read-only files have labels and content');
assert(bundle.readOnlyFiles.some(file => /\.map$/.test(file.path)), '14.12 includes a real source map');
assert(bundle.readOnlyFiles.some(file => /provenance/i.test(file.path)), '14.12 includes build provenance');

for (const id of ['12.01','12.04']) {
  assert.equal(assessments[id]?.environment,'rubric',id+' remains human-reviewed');
  assert(!assessments[id]?.checks?.includes('behavior'),id+' does not become an automatic test pass');
  assert.equal(assessments[id]?.predictionTable?.outputFormat,'lines',id+' compares observed log lines');
  assert.equal(publishedAssessments[id]?.environment,'rubric',id+' publishes the declared evidence label');
}
const controller=readFileSync(new URL('public/course-controller.js',root),'utf8');
assert.match(controller,/predictionTable\?\.outputFormat === "lines"/);
assert.match(controller,/source: "rubric-declared"/);
assert.match(controller,/kind: observed\.kind === "result" \? "observed"/);
for (const id of ['11.01','12.01','12.04']) {
  assert.equal(assessments[id]?.predictionTable?.version, 1, `${id} has structured prediction fields`);
  assert.equal(readJson('course-src/predictions.json')[id]?.cases?.length, 1, `${id} has a protected expected observation`);
}
const eventDelegation = readFileSync(new URL('course-src/tests/11.11.test.js', root), 'utf8');
assert.match(eventDelegation, /installed\s*=\s*instalar\(/, '11.11 tests invoke the submitted installer');
assert.match(eventDelegation, /installed\.log/, '11.11 assertions inspect the submitted installer result');
assert.doesNotMatch(eventDelegation, /item\.addEventListener\(/, '11.11 must not recreate the implementation inside the test');
assert.match(eventDelegation, /fora-capture/);assert.match(eventDelegation, /menu-bubble/);assert.match(eventDelegation, /defaultPrevented:true/);assert.match(eventDelegation, /stopImmediatePropagation/);
const propagationTests=readFileSync(new URL('course-src/tests/11.01.test.js',root),'utf8');assert.match(propagationTests,/stopPropagation/);assert.match(propagationTests,/stopImmediatePropagation/);
const listenerTests=readFileSync(new URL('course-src/tests/11.14.test.js',root),'utf8');assert.match(listenerTests,/signal já abortado/);

const reportPath = new URL('output/fase2/task2-report.md', root);
assert(existsSync(reportPath), 'task2 report records all 59 decisions');
const report = readFileSync(reportPath, 'utf8');
assert.match(report, /\| 59 \| 15 convertidas \| 44 declaradas \|/);
const matrixRows = report.split('\n').filter(line => /^\| \d{2}\.\d{2} \|/.test(line));
assert.equal(matrixRows.length, 59, `decision matrix has one row per baseline assessment; found ${matrixRows.length}`);
assert.equal(new Set(matrixRows.map(line => line.split('|')[1].trim())).size, 59, 'decision matrix IDs are unique');

console.log(`Phase 2 artifacts contract passed: ${sourceIds.length} prose starters, ${convertedIds.length} executable decisions, ${declared.length} declared decisions, structured predictions, and bundle evidence.`);
