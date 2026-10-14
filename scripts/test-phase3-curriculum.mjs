import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import {runLocalCourseCheck} from './check-local-course-cli.mjs';

const root = new URL('../', import.meta.url);
const ids = ['07.11', '07.12', '12.15', '12.16', '14.14', '14.15', '14.16', '14.17', '14.18', '21.12'];

async function json(relative) {
  return JSON.parse(await readFile(new URL(relative, root), 'utf8'));
}

test('Phase 3 adds each tool milestone to the published curriculum', async () => {
  const catalog = await json('public/course-catalog.json');
  const catalogIds = new Set(catalog.map(item => item.id));
  for (const id of ids) assert.ok(catalogIds.has(id), `${id} must be published`);
});

test('new local projects declare executable commands and learner-declared evidence', async () => {
  const assessments = await json('course-src/assessments.json');
  const checkpoints = await json('course-src/local-checkpoints.json');
  const targets = new Map(checkpoints.targets.map(target => [target.id, target]));
  for (const id of ids) {
    const assessment = assessments[id];
    assert.equal(assessment?.environment, 'local', `${id} must be a local project`);
    assert.ok(assessment?.local?.commands?.length, `${id} must declare commands`);
    assert.equal(assessment?.local?.evidenceLabel, 'learner-declared', `${id} must label manual evidence`);
    assert.ok(assessment?.referenceDir, `${id} must have a clean-checkout reference`);
    const target = targets.get(id);
    assert.ok(target, `${id} must have an export checkpoint`);
    assert.ok(target.commands?.length, `${id} checkpoint must list commands`);
    assert.equal(target.evidenceLabel, 'learner-declared', `${id} checkpoint must label manual evidence`);
  }
});

test('Git progression starts with a local repository and reaches branch, conflict and PR practice', async () => {
  const checkpoints = await json('course-src/local-checkpoints.json');
  const byId = new Map(checkpoints.targets.map(target => [target.id, target]));
  const primer = byId.get('07.11').gitStep.steps.join('\n');
  for (const command of ['git init', 'git add', 'git commit', 'git diff', 'git log']) assert.ok(primer.includes(command));
  const collaboration = byId.get('11.08').gitStep.steps.join('\n');
  for (const command of ['git switch -c', 'git merge', 'conflito', 'Pull Request']) assert.ok(collaboration.includes(command));
  assert.equal(byId.get('07.12').reviewStep.required, true);
  assert.match(byId.get('07.12').reviewStep.steps.join('\n'), /3–5/);
});

test('local project panel presents declared code-review practice', async () => {
  const source = await readFile(new URL('public/local-checkpoints.js', root), 'utf8');
  const panel = await readFile(new URL('public/local-project-panel.js', root), 'utf8');
  const context = {};
  vm.runInNewContext(source, context);
  vm.runInNewContext(panel, context);
  const checkpoint = context.DevPathLocalCheckpoints.byId('07.12');
  assert.equal(checkpoint.reviewStep.required, true);
  const markup = context.DevPathLocalProjectPanel.renderPanel(
    {id: '07.12', kind: 'PROJECT'},
    {assessment: {environment: 'local'}, checkpoint},
  );
  assert.match(markup, /Revisão de código/);
  assert.match(markup, /prioridade/);
});

test('every Phase 3 local project reference runs in a disposable clean copy', {timeout: 180_000}, async () => {
  for (const id of ids) {
    const result = await runLocalCourseCheck(['--id', id]);
    assert.equal(result.exitCode, 0, `${id}: ${result.output}`);
    assert.equal(result.timedOut, false, `${id} timed out`);
    assert.doesNotMatch(result.output, /course-src\\solutions\\/i, `${id} ran against its source instead of a temp copy`);
  }
});

test('Phase 3 lesson ordering keeps local Vitest before 13, local TypeScript before 15, and browser tools in 12 and 21', async () => {
  const catalog = await json('public/course-catalog.json');
  const byId = new Map(catalog.map(item => [item.id, item]));
  assert.ok(catalog.findIndex(item => item.id === '12.15') < catalog.findIndex(item => item.stage === '13'));
  assert.ok(catalog.findIndex(item => item.id === '14.14') < catalog.findIndex(item => item.stage === '15'));
  for (const id of ids) assert.ok(byId.has(id));
  assert.match(byId.get('12.15').prompt, /Vitest/i);
  assert.match(byId.get('12.16').prompt, /Network/i);
  assert.match(byId.get('14.14').prompt, /erasableSyntaxOnly/i);
  assert.match(byId.get('14.15').prompt, /Prettier/i);
  assert.match(byId.get('14.16').prompt, /Vite/i);
  assert.match(byId.get('14.17').prompt, /GitHub Actions/i);
  assert.match(byId.get('14.18').prompt, /npm ci/i);
  assert.match(byId.get('21.12').prompt, /Performance/i);
});
