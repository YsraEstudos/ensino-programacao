import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const readJson = (relativePath) => JSON.parse(readFileSync(path.join(root, relativePath), 'utf8'));
const checkerVersion = readJson('package.json').devDependencies.typescript;
const tscPath = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc');

function typecheck(project) {
  const result = spawnSync(process.execPath, [tscPath, '--noEmit', '--project', project], {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
  });
  assert.equal(result.status, 0, `${project}\n${result.stdout}${result.stderr}`);
}

test('a etapa 15 distingue o alvo didático do checker local usado como proxy', () => {
  const source = readFileSync(path.join(root, 'course-src/recipes/15.py'), 'utf8');
  const starter = readJson('course-src/starters/15.08/package.json');
  const lock = readJson('course-src/starters/15.08/package-lock.json');
  const baseline = readJson('course-src/runtime-baseline.json');

  assert.equal(checkerVersion, '6.0.3');
  assert.equal(starter.devDependencies.typescript, checkerVersion);
  assert.equal(lock.packages[''].devDependencies.typescript, checkerVersion);
  assert.equal(baseline.typescript.course, '7.0');
  assert.equal(baseline.typescript.embeddedChecker, '6.0');
  assert.match(source, /TypeScript 7\.0 strict/);
});

test('typechecks configurados para as referências 15.07 e 15.08 passam', () => {
  typecheck('course-src/solutions/15.07/tsconfig.json');
  typecheck('course-src/solutions/15.08/assessment.tsconfig.json');
});
