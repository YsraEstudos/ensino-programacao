import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const checkpointSourceUrl = new URL('../course-src/local-checkpoints.json', import.meta.url);
const checkpointMirrorUrl = new URL('../public/local-checkpoints.js', import.meta.url);

test('browser checkpoint targets mirror the canonical curriculum source', async () => {
  const definitions = JSON.parse(await readFile(checkpointSourceUrl, 'utf8'));
  const context = {};
  vm.runInNewContext(await readFile(checkpointMirrorUrl, 'utf8'), context);
  const browserTargets = JSON.parse(JSON.stringify(context.DevPathLocalCheckpoints.targets));
  assert.equal(definitions.schemaVersion, 1);
  assert.deepEqual(browserTargets, definitions.targets);
});

test('local checkpoint builder check proves the browser mirror is current', () => {
  const result = spawnSync(process.execPath, ['scripts/build-local-checkpoints.mjs', '--check'], {cwd: root, encoding: 'utf8'});
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /targets match the canonical source/);
});

test('checkpoint source validation rejects targets without executable commands', async () => {
  const {localCheckpointDefinitionIssues} = await import('../scripts/local-assessment-validation.mjs');
  assert.equal(typeof localCheckpointDefinitionIssues, 'function', 'checkpoint definition validator is exported');
  const issues = localCheckpointDefinitionIssues({schemaVersion: 1, targets: [{id: '14.08', activityIds: ['14.08'], commands: []}]});
  assert.ok(issues.some(issue => issue.id === '14.08' && issue.code === 'CHECKPOINT_COMMANDS_MISSING'));
});

test('the Stage 14 project checkpoint links to the local path lesson 14.05', async () => {
  const context = {};
  vm.runInNewContext(await readFile(checkpointMirrorUrl, 'utf8'), context);
  vm.runInNewContext(await readFile(new URL('../public/local-project-panel.js', import.meta.url), 'utf8'), context);
  const checkpoint = context.DevPathLocalCheckpoints.byId('14.08');
  assert.deepEqual(Array.from(checkpoint.referenceActivityIds || []), ['14.05']);
  const html = context.DevPathLocalProjectPanel.renderPanel(
    {id: '14.08', kind: 'PROJECT'},
    {assessment: {environment: 'local'}, checkpoint}
  );
  assert.match(html, /href="#\/javascript\/14\.05"/);
});

