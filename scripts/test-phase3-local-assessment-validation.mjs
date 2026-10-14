import assert from 'node:assert/strict';
import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const contractUrl = new URL('./local-assessment-validation.mjs', import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));

 test('local assessment validation rejects an assessment without documented commands', async () => {
  const {localAssessmentCommandIssues} = await import(contractUrl);
  const issues = localAssessmentCommandIssues({
    '14.03': {environment: 'local', checks: ['local'], local: {evidence: ['resultado']}}
  });
  assert.deepEqual(issues.map(issue => issue.id), ['14.03']);
  assert.match(issues[0].message, /local\.commands/);
});

test('curriculum source validator rejects a local assessment without local.commands', async t => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'devpath-phase3-assessment-'));
  t.after(() => rm(tempRoot, {recursive: true, force: true}));
  const sourcePath = path.join(tempRoot, 'assessments.json');
  await writeFile(sourcePath, JSON.stringify({
    '14.03': {environment: 'local', checks: ['local']},
  }));
  const result = spawnSync(process.execPath, ['scripts/validate-curriculum-source.mjs'], {
    cwd: root,
    encoding: 'utf8',
    env: {...process.env, DEVPATH_ASSESSMENTS_SOURCE: sourcePath},
  });
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stderr, /ERROR 14\.03 LOCAL_COMMANDS_MISSING/);
});

test('local assessment validation accepts structured commands and ignores other environments', async () => {
  const {localAssessmentCommandIssues} = await import(contractUrl);
  const issues = localAssessmentCommandIssues({
    '14.03': {environment: 'local', local: {commands: [['node', '--version']] }},
    '07.01': {environment: 'javascript'}
  });
  assert.deepEqual(issues, []);
});

