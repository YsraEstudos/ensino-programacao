import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const project = new URL('../', import.meta.url);
const workspace = new URL('../../', import.meta.url);
const json = path => JSON.parse(fs.readFileSync(new URL(path, project), 'utf8'));

test('one self-contained project retains the complete curriculum and latest revisions', () => {
  const catalog = json('public/course-catalog.json');
  assert.equal(catalog.length, 254);
  assert.equal(new Set(catalog.map(item => item.id)).size, 254);
  assert.deepEqual([...new Set(catalog.map(item => item.stage))], ['D', ...Array.from({length: 24}, (_, i) => String(i).padStart(2, '0'))]);
  assert(catalog.filter(item => item.stage === '01').every(item => item.preparation.conceptSteps.length >= 3));
  assert.equal(catalog.find(item => item.id === '03.09').contentVersion, 2);
  assert.match(fs.readFileSync(new URL('course-src/stages/02.txt', project), 'utf8'), /não comprova sozinha domínio/);
  assert.match(fs.readFileSync(new URL('course-src/stages/03.txt', project), 'utf8'), /reservar for\.\.\.of/);
});

test('public curriculum matches the current generated editorial data', async () => {
  const {createCourseArtifacts} = await import('../course-src/build-public-curriculum.mjs');
  const artifacts = createCourseArtifacts();
  assert(artifacts instanceof Map);
  for (const [path, contents] of artifacts) {
    assert.equal(fs.readFileSync(new URL(path, project), 'utf8'), contents, `Regenerate ${path}`);
  }
});

test('generated curriculum intermediates live in the ignored generated directory', () => {
  for (const name of ['resolved_preview.json', 'concept_graph.json', 'audit_coverage.json']) {
    assert.equal(fs.existsSync(new URL(`course-src/${name}`, project)), false, `Generated source copy remains: ${name}`);
    assert.equal(fs.existsSync(new URL(`course-src/.generated/${name}`, project)), true, `Missing generated intermediate: ${name}`);
  }
  assert.match(fs.readFileSync(new URL('.gitignore', project), 'utf8'), /course-src\/\.generated/);
});

test('obsolete checkouts and the old static application are absent', () => {
  for (const path of ['devpath-full-catalog', 'course-src', 'app.js', 'index.html', 'styles.css', 'js-stage00-ui.js', 'js-stage00-runner.js']) {
    assert.equal(fs.existsSync(new URL(path, workspace)), false, `Obsolete duplicate: ${path}`);
  }
});
