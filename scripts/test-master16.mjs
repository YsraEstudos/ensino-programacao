import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { checkTypes } from './typecheck-entry.mjs';

const root = resolve('.');
const libraryRoot = resolve('node_modules/typescript/lib');
// The course targets TypeScript 7.0; this virtual checker embeds 6.0 as a limited proxy.
const reusedIds = new Set(['16.10', '18.07', '18.10', '19.06']);
const ids = [
  '16.06', '16.07',
  ...['17.01', '17.02', '17.03', '17.04', '17.05', '17.06', '17.07', '17.08', '17.09', '17.11'],
  ...['18.01', '18.02', '18.03', '18.04', '18.05', '18.06', '18.08', '18.09', '18.11'],
  ...['19.01', '19.02', '19.03', '19.04', '19.05', '19.07'],
];
function addTree(libraries, directory, prefix) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    const virtual = `${prefix}/${name}`;
    if (statSync(path).isDirectory()) addTree(libraries, path, virtual);
    else if (name.endsWith('.d.ts') || name === 'package.json') libraries[virtual] = readFileSync(path, 'utf8');
  }
}

function installedLibraries() {
  const libraries = {};
  for (const name of readdirSync(libraryRoot)) {
    if (!/^lib\..+\.d\.ts$/.test(name)) continue;
    const content = readFileSync(join(libraryRoot, name), 'utf8');
    libraries[`/node_modules/typescript/lib/${name}`] = content;
    libraries[`/${name}`] = content;
  }
  addTree(libraries, resolve('node_modules/@types/node'), '/node_modules/@types/node');
  addTree(libraries, resolve('node_modules/undici-types'), '/node_modules/undici-types');
  return libraries;
}

function solutionFiles(referenceDir) {
  const directory = resolve('course-src', referenceDir);
  const files = [];
  const visit = current => {
    for (const name of readdirSync(current)) {
      const path = join(current, name);
      if (statSync(path).isDirectory()) visit(path);
      else files.push({ path: relative(directory, path).replaceAll('\\', '/'), content: readFileSync(path, 'utf8') });
    }
  };
  visit(directory);
  return files;
}

const assessments = JSON.parse(readFileSync(join(root, 'public/course-assessments.json'), 'utf8'));
const libraries = installedLibraries();

test('TypeScript configurado aceita as referências e os contratos de transferência da Fase 16', async t => {
  for (const id of ids) {
    const assessment = assessments[id];
    if (!assessment?.checks?.includes('types') || reusedIds.has(id)) continue;
    await t.test(id, () => {
      const contracts = assessment.contractTypeFiles || [];
      const result = checkTypes({
        files: [...solutionFiles(assessment.referenceDir), ...contracts],
        entryPaths: [assessment.entryPath, ...contracts.map(file => file.path)].filter(Boolean),
        tsconfigPath: assessment.tsconfigPath,
      }, { libraries });
      assert.equal(result.supported, true, `TypeScript indisponível: ${JSON.stringify(result.diagnostics)}`);
      assert.deepEqual(result.diagnostics.filter(diagnostic => diagnostic.category === 'error'), [],
        `Falha de tipos em ${id}: ${JSON.stringify(result.diagnostics)}`);

      for (const mutant of assessment.typeContractMutants || []) {
        const mutantFiles = new Map(solutionFiles(assessment.referenceDir).map(file => [file.path, file]));
        for (const file of mutant.files || []) mutantFiles.set(file.path, file);
        const rejected = checkTypes({
          files: [...mutantFiles.values(), ...contracts],
          entryPaths: [assessment.entryPath, ...contracts.map(file => file.path)].filter(Boolean),
          tsconfigPath: assessment.tsconfigPath,
        }, { libraries });
        assert.equal(rejected.supported, true, `${id}/${mutant.id}: checker indisponível`);
        assert.ok(rejected.diagnostics.some(diagnostic => diagnostic.category === 'error'),
          `${id}/${mutant.id}: contrato aceitou o mutante`);
      }
    });
  }
});
