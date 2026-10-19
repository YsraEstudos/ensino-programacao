import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, mkdtempSync, mkdirSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';

const root = path.resolve(process.argv[2] || '.');
const id = '23.04';
const catalog = JSON.parse(readFileSync(path.join(root, 'public/course-catalog.json'), 'utf8'));
const assessment = JSON.parse(readFileSync(path.join(root, 'public/course-assessments.json'), 'utf8'))[id];
const activity = catalog.find(item => item.id === id);
const starterPath = path.join(root, 'course-src/starters/23.04/legado.js');
const childEnv = {...process.env};
delete childEnv.NODE_TEST_CONTEXT;

function repository(seed = []) {
  let rows = structuredClone(seed);
  const calls = [];
  return {
    listar() { calls.push('listar'); return structuredClone(rows); },
    salvar(value) { calls.push('salvar'); rows.push(structuredClone(value)); },
    atualizar(value) { calls.push('atualizar'); rows = rows.map(row => row.id === value.id ? structuredClone(value) : row); },
    registrar(...args) { calls.push(['registrar', ...args]); },
    get rows() { return rows; },
    get calls() { return calls; },
  };
}

function semanticAssertionFailure(run, expectedTestName) {
  const output = `${run.stdout}\n${run.stderr}`;
  const testCount = Number(output.match(/^# tests (\d+)$/m)?.[1] || 0);
  const failedTests = [...output.matchAll(/^not ok \d+ - (.+)$/gm)].map(match => match[1]);
  return run.status === 1
    && testCount === 4
    && output.includes('# pass 3')
    && output.includes('# fail 1')
    && failedTests.includes(expectedTestName)
    && output.includes('ERR_ASSERTION');
}

function runProtectedSuite(directory, harness) {
  const suitePath = path.join(directory, 'protected-suite.mjs');
  writeFileSync(suitePath, harness, 'utf8');
  return spawnSync(process.execPath, ['--test', '--test-reporter=tap', suitePath], {
    cwd: directory, encoding: 'utf8', timeout: 30000, windowsHide: true, env: childEnv,
  });
}

test('23.04 publishes the exact API, data formats and failure behavior', () => {
  assert.ok(activity);
  assert.equal(assessment.entryPath, 'legado.js');
  assert.match(assessment.tests, /criarCadastroCliente,atualizarCliente/);
  for (const text of [
    'criarCadastroCliente(repo, nome, email, idade)',
    'atualizarCliente(repo, id, nome, email, idade)',
    'listar', 'salvar', 'atualizar', 'registrar',
    'nome obrigatório', 'email inválido', 'idade mínima 18',
    'email já cadastrado', 'cliente não encontrado',
    'node --test legado.test.js',
  ]) assert.ok(activity.prompt.includes(text), `Prompt 23.04 omits ${text}`);
  assert.match(activity.prompt, /ok:\s*true/);
  assert.match(activity.prompt, /ok:\s*false/);
  assert.match(activity.prompt, /normaliz|trimado em minúsculas/);
  assert.match(activity.prompt, /após cada (?:passo|um)/);
  assert.deepEqual(activity.starterFiles.map(file => file.path).sort(), ['legado.js', 'legado.test.js']);
});

test('23.04 starter accepts an injected repository and preserves characterized results', async () => {
  const starter = await import(pathToFileURL(starterPath).href);
  assert.equal(typeof starter.criarCadastroCliente, 'function');
  assert.equal(typeof starter.atualizarCliente, 'function');

  const repo = repository();
  assert.deepEqual(starter.criarCadastroCliente(repo, ' Ana ', ' ANA@EXAMPLE.COM ', '18'), {
    ok: true, cliente: {id: 1, nome: 'Ana', email: 'ana@example.com', idade: 18},
  });
  assert.deepEqual(repo.calls, ['listar', 'salvar', ['registrar', 'cadastro', 'ana@example.com']]);
  const callsBefore = repo.calls.length;
  assert.deepEqual(starter.criarCadastroCliente(repo, 'Bia', 'ANA@EXAMPLE.COM', 20), {ok: false, erro: 'email já cadastrado'});
  assert.deepEqual(starter.atualizarCliente(repo, 99, 'Bia', 'bia@x', 20), {ok: false, erro: 'cliente não encontrado'});
  assert.deepEqual(starter.criarCadastroCliente(repo, '', 'bia@x', 20), {ok: false, erro: 'nome obrigatório'});
  assert.equal(repo.calls.slice(callsBefore).filter(call => call === 'salvar' || call === 'atualizar' || Array.isArray(call)).length, 0);
});

test('23.04 local characterization suite passes against the published starter', () => {
  const run = spawnSync(process.execPath, ['--test', path.join(root, 'course-src/starters/23.04/legado.test.js')], {
    cwd: root, encoding: 'utf8', timeout: 30000, windowsHide: true, env: childEnv,
  });
  assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}`);
});

test('23.04 protected assessment rejects semantic regressions', () => {
  const requiredMutants = ['allow-duplicate-email', 'update-no-op', 'write-on-failure', 'accept-invalid-email', 'accept-underage'];
  const mutants = new Map((assessment.mutantDirs || []).map(mutant => [mutant.id, mutant]));
  for (const mutantId of requiredMutants) assert.ok(mutants.has(mutantId), `Assessment is missing ${mutantId}`);
  const cases = assessment.assertionCases || [];
  assert.ok(cases.length >= 18, `Assessment has only ${cases.length} published 23.04 assertion cases`);
  const assertions = new Set(cases.map(item => item.assertionExpression));
  for (const expected of [
    "expect(atualizarCliente(r,1,' Ana Maria ',' ANA@EXAMPLE.COM ','22')).toEqual({ok:true})",
    "expect(r.rows).toEqual([{id:1,nome:'Ana Maria',email:'ana@example.com',idade:22}])",
    'expect(r.writes).toEqual([])', 'expect(r.rows).toEqual(seed)', 'expect(r.log).toEqual([])',
  ]) assert.ok(assertions.has(expected), `Published assertionCases omits ${expected}`);

  const tempRoot = mkdtempSync(path.join(tmpdir(), 'devpath-2304-assessment-'));
  const harness = `import {test} from 'node:test';\nimport assert from 'node:assert/strict';\nconst expect = value => ({toBe(expected){assert.equal(value, expected)},toEqual(expected){assert.deepEqual(value, expected)}});\n${assessment.tests}\n`;
  const expectedFailingTest = mutantId => mutantId === 'update-no-op'
    ? 'successful update changes normalized row and records exactly once'
    : 'invalid email, underage, duplicate and missing client return exact errors without writes or state changes';
  for (const mutantId of requiredMutants) {
    const mutant = mutants.get(mutantId);
    const mutantRoot = path.join(tempRoot, mutantId);
    mkdirSync(mutantRoot, {recursive: true});
    for (const file of mutant.files || []) {
      const target = path.join(mutantRoot, file.path);
      mkdirSync(path.dirname(target), {recursive: true});
      writeFileSync(target, file.content, 'utf8');
    }
    const run = runProtectedSuite(mutantRoot, harness);
    const output = `${run.stdout}\n${run.stderr}`;
    assert.ok(semanticAssertionFailure(run, expectedFailingTest(mutantId)),
      `Mutant ${mutantId} was not killed by its expected protected assertion:\n${output}`);
  }

  const infrastructureProbes = [
    {id: 'missing-module', expected: /ERR_MODULE_NOT_FOUND|Cannot find module/i},
    {id: 'missing-export', expected: /is not a function|does not provide an export/i},
    {id: 'syntax-error', expected: /SyntaxError|Unexpected token/i},
  ];
  for (const probe of infrastructureProbes) {
    const probeRoot = path.join(tempRoot, 'infrastructure-' + probe.id);
    mkdirSync(probeRoot, {recursive: true});
    if (probe.id !== 'missing-module') {
      const source = probe.id === 'missing-export' ? 'export const other = true;\n' : 'export function {\n';
      writeFileSync(path.join(probeRoot, 'legado.js'), source, 'utf8');
    }
    const run = runProtectedSuite(probeRoot, harness);
    const output = `${run.stdout}\n${run.stderr}`;
    assert.notEqual(run.status, 0, `${probe.id} probe unexpectedly passed`);
    assert.match(output, probe.expected, `${probe.id} did not produce the expected infrastructure error:\n${output}`);
    assert.equal(semanticAssertionFailure(run, expectedFailingTest('write-on-failure')), false,
      `${probe.id} infrastructure failure was misclassified as a semantic mutant kill`);
  }
});
