import assert from 'node:assert/strict';
import {cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync} from 'node:fs';
import {createHash} from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {isStrictDescendant} from './temporary-path-guard.mjs';

const repository = path.resolve(import.meta.dirname, '..');
const generators = [
  'task-9-stage22.mjs',
  'task-9-stage23.mjs',
  'task-9-stage23-12.mjs',
  'task-9-remaining-assessments.mjs',
  'task-9-canonical-texts.mjs',
];

function copyInputs(target) {
  cpSync(path.join(repository, 'course-src'), path.join(target, 'course-src'), {
    recursive: true,
    filter(source) {
      const relative = path.relative(repository, source).split(path.sep);
      return !relative.includes('node_modules') && !relative.includes('.git');
    },
  });
  const scriptsPath = path.join(target, 'scripts');
  mkdirSync(scriptsPath, {recursive: true});
  for (const name of [...generators, 'task-9-advanced-repairs.mjs', 'task-9-contract-block.mjs', 'temporary-path-guard.mjs']) {
    cpSync(path.join(repository, 'scripts', name), path.join(scriptsPath, name));
  }
}

function run(command, args, cwd, timeout = 300_000) {
  const env = {...process.env};
  delete env.NODE_TEST_CONTEXT;
  const result = spawnSync(command, args, {cwd, env, encoding: 'utf8', timeout, windowsHide: true});
  assert.equal(result.error, undefined, `${command} ${args.join(' ')}: ${result.error?.message ?? ''}`);
  assert.equal(result.status, 0, `${command} ${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`);
  return result.stdout.trim();
}

function runResult(command, args, cwd, timeout = 300_000) {
  const env = {...process.env};
  delete env.NODE_TEST_CONTEXT;
  return spawnSync(command, args, {cwd, env, encoding: 'utf8', timeout, windowsHide: true});
}

function focusedGeneration(root) {
  for (const file of generators) run(process.execPath, [path.join('scripts', file)], root);
}

function hashFiles(root, files) {
  return Object.fromEntries(files.map(file => [
    file,
    createHash('sha256').update(readFileSync(path.join(root, file))).digest('hex'),
  ]));
}

function usePinnedWorkspaceDependencies(packagePath) {
  const workspaceModules = path.join(repository, 'node_modules');
  const localModules = path.join(packagePath, 'node_modules');
  const expectedVersions = new Map([
    ['typescript', '6.0.3'],
    ['@types/node', '24.19.1'],
    ['undici-types', '7.24.6'],
  ]);
  mkdirSync(localModules, {recursive: true});
  for (const [name, version] of expectedVersions) {
    const source = path.join(workspaceModules, name);
    assert.equal(JSON.parse(readFileSync(path.join(source, 'package.json'), 'utf8')).version, version,
      `fallback dependency ${name} must match the explicit package lock`);
    cpSync(source, path.join(localModules, name), {recursive: true});
  }
  const localBin = path.join(localModules, '.bin');
  mkdirSync(localBin, {recursive: true});
  for (const name of ['tsc', 'tsc.cmd', 'tsc.ps1']) {
    const source = path.join(workspaceModules, '.bin', name);
    if (existsSync(source)) cpSync(source, path.join(localBin, name));
  }
}

function installAndCheck(root, relativePackage, fallbackPackages, expectBehaviorRed = false) {
  const packagePath = path.join(root, relativePackage);
  const npmCli = path.resolve(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
  assert.ok(existsSync(npmCli), `npm CLI not found beside Node: ${npmCli}`);
  const npm = [process.execPath, npmCli];
  const install = runResult(npm[0], [...npm.slice(1), 'ci', '--offline', '--ignore-scripts'], packagePath);
  assert.equal(install.error, undefined, `npm ci: ${install.error?.message ?? ''}`);
  if (install.status !== 0) {
    const output = `${install.stdout}\n${install.stderr}`;
    assert.match(output, /ENOTCACHED/, `npm ci failed for a reason other than an unavailable offline cache:\n${output}`);
    usePinnedWorkspaceDependencies(packagePath);
    fallbackPackages.push(relativePackage);
  }
  const tests = runResult(npm[0], [...npm.slice(1), 'test'], packagePath);
  assert.equal(tests.error, undefined, `npm test: ${tests.error?.message ?? ''}`);
  const testOutput = `${tests.stdout}\n${tests.stderr}`;
  if (expectBehaviorRed) {
    assert.notEqual(tests.status, 0, `${relativePackage} learner TODOs should be exposed by its behavioral tests\n${testOutput}`);
    for (const label of ['admin reabre a tarefa', 'usuário comum é negado', 'falha ao persistir']) {
      assert.match(testOutput, new RegExp(label), `missing behavioral case ${label}:\n${testOutput}`);
    }
  } else {
    assert.equal(tests.status, 0, `npm test failed\n${testOutput}`);
  }
  run(npm[0], [...npm.slice(1), 'run', 'typecheck'], packagePath);
}

function verifyStage23Content() {
  const scratch = mkdtempSync(path.join(os.tmpdir(), 'devpath-stage23-'));
  assert.ok(isStrictDescendant(scratch, os.tmpdir()), 'scratch must remain below os.tmpdir()');
  try {
    copyInputs(scratch);
    focusedGeneration(scratch);
    const checkedFiles = [
      'course-src/assessments.json',
      'course-src/starters/manifest.json',
      ...['23.07', '23.08'].flatMap(id => [
        `course-src/starters/${id}/package.json`,
        `course-src/starters/${id}/package-lock.json`,
        `course-src/starters/${id}/tsconfig.json`,
        `course-src/solutions/${id}/package.json`,
        `course-src/solutions/${id}/package-lock.json`,
        `course-src/solutions/${id}/tsconfig.json`,
        `course-src/solutions/${id}/README.md`,
      ]),
      'course-src/starters/23.08/test/contrato.test.ts',
      'course-src/solutions/23.09/README.md',
      'course-src/solutions/23.09/operacao.test.js',
    ];
    const firstHashes = hashFiles(scratch, checkedFiles);

    const assessments = JSON.parse(readFileSync(path.join(scratch, 'course-src/assessments.json'), 'utf8'));
    assert.deepEqual(assessments['23.07'].local.commands, [
      ['npm', 'ci'], ['npm', 'test'], ['npm', 'run', 'typecheck'],
    ]);
    assert.deepEqual(assessments['23.08'].local.commands, [
      ['npm', 'ci'], ['npm', 'test'], ['npm', 'run', 'typecheck'],
    ]);
    assert.match(assessments['23.05'].transfer.files[0].content, /sugestão de IA/i);
    assert.match(assessments['23.05'].transfer.files[0].content, /lacuna/i);
    assert.match(assessments['23.09'].transfer.files[0].content, /resposta/i);
    assert.match(assessments['23.09'].transfer.files[0].content, /cause profundamente redigida/i);
    assert.match(readFileSync(path.join(scratch, 'scripts/task-9-advanced-repairs.mjs'), 'utf8'), /Resposta pública informa apenas falha e ID; log interno preserva causa técnica útil/);
    const starter23 = readFileSync(path.join(scratch, 'course-src/starters/23.08/test/contrato.test.ts'), 'utf8');
    assert.match(starter23, /mover e remover/);
    assert.match(starter23, /falha de storage preservam o estado anterior/);
    const reopenStarterTest = readFileSync(path.join(scratch, 'course-src/starters/23.07/test/reabrir.test.ts'), 'utf8');
    assert.doesNotMatch(reopenStarterTest, /test\.todo/);
    assert.match(reopenStarterTest, /usuário comum é negado antes de qualquer escrita/);

    for (const id of ['23.07', '23.08']) {
      const starter = JSON.parse(readFileSync(path.join(scratch, `course-src/starters/${id}/package.json`), 'utf8'));
      const lock = JSON.parse(readFileSync(path.join(scratch, `course-src/starters/${id}/package-lock.json`), 'utf8'));
      assert.equal(starter.scripts.typecheck, 'tsc --noEmit -p tsconfig.json');
      assert.equal(starter.devDependencies.typescript, '6.0.3');
      assert.equal(starter.devDependencies['@types/node'], '24.19.1');
      assert.equal(lock.packages[''].devDependencies.typescript, starter.devDependencies.typescript);
      assert.equal(lock.packages[''].devDependencies['@types/node'], starter.devDependencies['@types/node']);
      const listed = JSON.parse(readFileSync(path.join(scratch, 'course-src/starters/manifest.json'), 'utf8'))[id].files;
      for (const file of listed) assert.ok(existsSync(path.join(scratch, `course-src/starters/${id}`, file)), `${id} manifest is missing ${file}`);
    }

    // Repeated generation should reproduce the Stage 23 files byte for byte.
    focusedGeneration(scratch);
    assert.deepEqual(hashFiles(scratch, checkedFiles), firstHashes);

    const fallbackPackages = [];
    for (const relative of [
      'course-src/starters/23.07',
      'course-src/starters/23.08',
      'course-src/solutions/23.07',
      'course-src/solutions/23.08',
    ]) installAndCheck(scratch, relative, fallbackPackages, relative === 'course-src/starters/23.07');
    if (fallbackPackages.length) {
      console.log(`npm ci offline cache unavailable; tests/typecheck used copied pinned dependencies for: ${fallbackPackages.join(', ')}`);
    }
    run(process.execPath, ['--test', 'operacao.test.js'], path.join(scratch, 'course-src/solutions/23.09'));
    assert.ok(readdirSync(path.join(scratch, 'course-src/starters/23.08/test')).includes('contrato.test.ts'));
  } finally {
    rmSync(scratch, {recursive: true, force: true});
  }
}

verifyStage23Content();
console.log('Stage 23 focused generation, package tests/typechecks, and redacted-log checks passed.');
