import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createCourseArtifacts} from '../course-src/build-public-curriculum.mjs';

const sourceAssessments = JSON.parse(readFileSync(new URL('../course-src/assessments.json', import.meta.url), 'utf8'));
const initialCatalog = JSON.parse(readFileSync(new URL('../output/fase2/catalog-before.json', import.meta.url), 'utf8'));
const catalog = JSON.parse(createCourseArtifacts().get('public/course-catalog.json'));
const byId = new Map(catalog.map(item => [item.id, item]));
const initialById = new Map(initialCatalog.map(item => [item.id, item]));
const generic = /aceite qualquer implementação|rode critérios comportamentais|rubrica de (?:localização|assinatura|hipótese)|avalie somente as decisões retiradas/i;
const genericScoring = /aceite qualquer implementação|rode critérios comportamentais/i;
const rubricFingerprint = rubric => `sha256:${createHash('sha256').update(JSON.stringify(rubric)).digest('hex')}`;

for (const [id, assessment] of Object.entries(sourceAssessments)) {
  if (id === '_comment') continue;
  const item = byId.get(id);
  assert(item, `${id} remains published`);
  if (assessment.rubric?.length) assert.deepEqual(item.rubric, assessment.rubric, `${id} publishes its assessment rubric`);
  assert(!item.rubric?.some(criterion => generic.test(criterion)), `${id} has no generic scoring criterion`);
  assert(!(item.checks || []).some(check => genericScoring.test(check.scoring || '')), `${id} has no generic scoring text beside its public examples`);
  if (item.rubric?.length) assert.equal(item.rubricFingerprint, rubricFingerprint(item.rubric), `${id} has a stable identity for the visible rubric`);
}

for (const id of ['09.08', '11.08', '12.08', '14.08', '23.08']) {
  const item = byId.get(id);
  assert(item?.rubric?.length >= 3, `${id} gives concrete criteria before the learner starts`);
  assert.equal(item.contentVersion, initialById.get(id)?.contentVersion, `${id} editorial rubric does not invalidate drafts`);
}

const capstoneTerms = {
  '11.08': ['contrato', 'reload', 'JSON', 'CRUD'],
  '12.08': ['API', 'timeout', 'cancelamento', 'HTTP', '404'],
  '14.08': ['CLI', 'repository', 'not-found', 'JSON', 'temporário'],
  '23.08': ['domínio', 'adapter', 'recarrega', 'teste', 'typecheck', 'README'],
};
for (const [id, terms] of Object.entries(capstoneTerms)) {
  const text = byId.get(id).rubric.join(' ').toLocaleLowerCase('pt-BR');
  for (const term of terms) assert(text.includes(term.toLocaleLowerCase('pt-BR')), `${id} exposes the ${term} delivery in its checklist`);
}

const savedEvidence = JSON.parse(readFileSync(new URL('../lib/progress-contract.json', import.meta.url), 'utf8')).defaults.exerciseEvidence;
assert.deepEqual(savedEvidence, {}, 'rubric identity is additive and does not change progress defaults');
const evidenceSource = readFileSync(new URL('../lib/progress-evidence.ts', import.meta.url), 'utf8');
assert.match(evidenceSource, /rubricFingerprint/);
const controller = readFileSync(new URL('../public/course-controller.js', import.meta.url), 'utf8');
assert.match(controller, /rubricFingerprint/);
assert.match(controller, /data-course-rubric/);

console.log('Phase 2 rubric and capstone gate passed.');
