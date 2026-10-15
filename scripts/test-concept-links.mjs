import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateConceptLinks } from './validate-concept-links.mjs';

const read = (rel) => JSON.parse(readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8'));
const realLinks = () => read('course-src/concept-links.json');
const realSource = () => ({
  concepts: read('course-src/.generated/concept_graph.json').concepts,
  catalog: read('public/course-catalog.json'),
});
const clone = (value) => structuredClone(value);
const find = (links, id) => links.concepts.find((c) => c.conceptId === id);

test('fonte real passa e produz resumo consistente', () => {
  const links = realLinks();
  const source = realSource();
  const summary = validateConceptLinks(links, source);
  assert.equal(summary.total, source.concepts.length);
  assert.equal(summary.total, summary.linked + summary.exempt + summary.needsNewActivity);
  assert.equal(typeof summary.newVariantsNeeded, 'number');
});

test('conceito faltando no links falha', () => {
  const links = clone(realLinks());
  links.concepts = links.concepts.filter((c) => c.conceptId !== 'execution.order');
  assert.throws(() => validateConceptLinks(links, realSource()), /execution\.order.*faltando/);
});

test('atividade inexistente falha', () => {
  const links = clone(realLinks());
  find(links, 'execution.order').activities = ['99.99'];
  assert.throws(() => validateConceptLinks(links, realSource()), /inexistente 99\.99/);
});

test('atividade anterior à introdução do conceito falha', () => {
  const links = clone(realLinks());
  // errors.try_catch é introduzido na etapa 06; 04.12 é da etapa 04.
  const link = find(links, 'errors.try_catch');
  link.activities = [...link.activities, '04.12'];
  assert.throws(() => validateConceptLinks(links, realSource()), /04\.12.*anterior à introdução/);
});

test('atividade opcional em activities e obrigatória em optionalActivities falham', () => {
  const links = clone(realLinks());
  // 06.12 é opcional: movê-la para activities deve falhar.
  const serialization = find(links, 'serialization.json');
  serialization.optionalActivities = [];
  serialization.activities.push('06.12');
  // 10.02 é obrigatória: movê-la para optionalActivities deve falhar.
  const classes = find(links, 'classes.basic');
  classes.activities = classes.activities.filter((id) => id !== '10.02');
  classes.optionalActivities = [...classes.optionalActivities, '10.02'];
  assert.throws(() => validateConceptLinks(links, realSource()), (error) => {
    assert.match(error.message, /06\.12 está em activities mas é opcional/);
    assert.match(error.message, /10\.02 está em optionalActivities mas é obrigatória/);
    return true;
  });
});

test('exempt ou needs-new-activity sem rationale falha', () => {
  const links = clone(realLinks());
  const link = find(links, 'streams.basic');
  link.rationale = '';
  assert.throws(() => validateConceptLinks(links, realSource()), /streams\.basic.*rationale ausente/);
});

test('linked sem nenhuma atividade falha', () => {
  const links = clone(realLinks());
  find(links, 'bindings.reassignment').activities = [];
  assert.throws(() => validateConceptLinks(links, realSource()), /linked.*sem nenhuma atividade/);
});

test('needs-new-activity com atividades obrigatórias falha', () => {
  const links = clone(realLinks());
  find(links, 'iterators.async').activities = ['20.01'];
  assert.throws(() => validateConceptLinks(links, realSource()), /needs-new-activity.*não pode listar/);
});

test('newVariantsNeeded ignora conceitos isentos e soma faltas até 3', () => {
  const links = {
    version: 1,
    concepts: [
      { conceptId: 'a', decision: 'linked', activities: ['00.01'], optionalActivities: [], kind: 'predict-read', rationale: 'x' },
      { conceptId: 'b', decision: 'exempt', activities: [], optionalActivities: [], kind: 'predict-read', rationale: 'x' },
      { conceptId: 'c', decision: 'needs-new-activity', activities: [], optionalActivities: [], kind: 'implementation', rationale: 'x' },
    ],
  };
  const concepts = [
    { id: 'a', introduced_at: '00' },
    { id: 'b', introduced_at: '00' },
    { id: 'c', introduced_at: '00' },
  ];
  const summary = validateConceptLinks(links, { concepts, catalog: [{ id: '00.01', stage: '00', optional: false }] });
  assert.deepEqual(summary, { total: 3, linked: 1, exempt: 1, needsNewActivity: 1, newVariantsNeeded: 2 + 3 });
});
