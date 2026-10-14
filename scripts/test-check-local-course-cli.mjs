import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {runLocalCourseCheck} from './check-local-course-cli.mjs';

async function withRoot(callback) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'local-course-cli-'));
  try {
    await fs.mkdir(path.join(root, 'solutions', '99.01'), {recursive: true});
    await fs.writeFile(path.join(root, 'solutions', '99.01', 'main.js'), 'export {};\n');
    await fs.mkdir(path.join(root, 'metadata'), {recursive: true});
    const assessment = {
      '99.01': {
        environment: 'local',
        version: 1,
        referenceDir: 'solutions/99.01',
        local: {commands: [[process.execPath, '-e', 'process.stdout.write(process.cwd())']]},
      },
    };
    await fs.writeFile(path.join(root, 'metadata', 'assessments.json'), JSON.stringify(assessment));
    return await callback(root);
  } finally {
    await fs.rm(root, {recursive: true, force: true});
  }
}

test('runs manifest-declared local reference commands in a disposable copy', async () => {
  await withRoot(async root => {
    const result = await runLocalCourseCheck(['--root', root, '--manifest', 'metadata/assessments.json', '--id', '99.01']);
    assert.equal(result.activityId, '99.01');
    assert.equal(result.scope, 'reference-verification');
    assert.equal(result.source, 'local-reference');
    assert.equal(result.exitCode, 0);
    assert.equal(result.timedOut, false);
    assert.equal(result.commands.length, 1);
    assert.match(result.output, /devpath-course-/);
    assert.doesNotMatch(result.output, new RegExp(root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
});

test('fails closed for missing IDs, non-local assessments, unsafe manifests, Git and install commands', async () => {
  await withRoot(async root => {
    await assert.rejects(() => runLocalCourseCheck(['--root', root, '--manifest', '../outside.json', '--id', '99.01']), /inside --root/);
    await assert.rejects(() => runLocalCourseCheck(['--root', root, '--manifest', 'metadata/assessments.json', '--id', '99.02']), /not found/);

    const manifestPath = path.join(root, 'metadata', 'assessments.json');
    const original = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    original['99.01'].local.commands = [['git', 'status']];
    await fs.writeFile(manifestPath, JSON.stringify(original));
    await assert.rejects(() => runLocalCourseCheck(['--root', root, '--manifest', 'metadata/assessments.json', '--id', '99.01']), /Git instructions/);

    original['99.01'].local.commands = [['npm', 'install']];
    await fs.writeFile(manifestPath, JSON.stringify(original));
    await assert.rejects(() => runLocalCourseCheck(['--root', root, '--manifest', 'metadata/assessments.json', '--id', '99.01']), /installation/);

    original['99.01'].environment = 'javascript';
    await fs.writeFile(manifestPath, JSON.stringify(original));
    await assert.rejects(() => runLocalCourseCheck(['--root', root, '--manifest', 'metadata/assessments.json', '--id', '99.01']), /not local/);
  });
});

// Documented invocation: no flags. Defaults must resolve referenceDir against course-src/, not the repository root.
test('--id 22.02 with no flags resolves the course-src reference and exits 0', {timeout: 240_000}, async () => {
  const result = await runLocalCourseCheck(['--id', '22.02']);
  assert.equal(result.activityId, '22.02');
  assert.equal(result.exitCode, 0, result.output);
  assert.equal(result.timedOut, false);
});
