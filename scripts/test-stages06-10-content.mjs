import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const root = new URL('../', import.meta.url);
const catalog = JSON.parse(readFileSync(new URL('public/course-catalog.json', root), 'utf8'));
const item = id => catalog.find(entry => entry.id === id);
const read = path => readFileSync(new URL(path, root), 'utf8');
const run = code => {
  const result = spawnSync(process.execPath, ['--input-type=module', '--eval', code], {encoding: 'utf8', timeout: 5000, windowsHide: true});
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
};
const lastJson = code => JSON.parse(run(code).split('\n').at(-1));

test('stages 06-10 have no Parsons activity and keep every target id published', () => {
  const stageItems = catalog.filter(entry => /^(0[6-9]|10)\./.test(entry.id));
  assert.deepEqual(stageItems.filter(entry => entry.kind === 'PARSONS'), []);
  const ids = new Set(catalog.map(entry => entry.id));
  for (const id of ['06.01', '06.03', '06.08', '07.02', '07.03', '07.06', '07.09', '07.10', '08.01', '08.02', '08.04', '08.07', '09.01', '09.02', '09.04', '09.08', '10.02', '10.03', '10.04', '10.06']) {
    assert.ok(ids.has(id), `missing ${id}`);
  }
});

test('06.01 publishes the same base, alias and copia names used by the starter', () => {
  const lesson = item('06.01');
  const material = JSON.stringify([lesson.examples, lesson.edgeCases]);
  assert.match(material, /base\.pontos/);
  assert.match(material, /alias\.pontos/);
  assert.match(material, /copia\.pontos/);
  assert.doesNotMatch(material, /\ba\.pontos\b/);
  assert.deepEqual(lastJson("import {observarAliasing} from './course-src/starters/06.01/main.js'; console.log(JSON.stringify(observarAliasing()));"), {
    pontos: 2,
    ativo: false,
    mesmaRaiz: false,
    mesmoMeta: true,
  });
});

test('the five former Parsons cards now expose real defects and their solutions repair them', () => {
  assert.equal(item('06.03').kind, 'DEBUG');
  assert.equal(item('07.03').kind, 'DEBUG');
  assert.equal(item('08.02').kind, 'FADED');
  assert.equal(item('09.02').kind, 'DEBUG');
  assert.equal(item('10.02').kind, 'DEBUG');

  assert.match(read('course-src/starters/06.03/main.js'), /senha/);
  assert.deepEqual(lastJson("import {normalizar} from './course-src/solutions/06.03/main.js'; console.log(JSON.stringify(normalizar({id: 7, nome: '  Ana  ', senha: 'x'})));"), {id: 7, nome: 'Ana'});

  assert.match(read('course-src/starters/07.03/main.js'), /a\.pontos - b\.pontos/);
  assert.deepEqual(lastJson("import {ranking} from './course-src/solutions/07.03/main.js'; console.log(JSON.stringify(ranking([{id: 'b', jogador: 'Bia', valida: true, pontos: 8}, {id: 'a', jogador: 'Ana', valida: true, pontos: 8}])));"), ['a', 'b']);

  assert.match(read('course-src/starters/08.02/main.js'), /return undefined/);
  assert.deepEqual(lastJson("import {somar} from './course-src/solutions/08.02/main.js'; console.log(JSON.stringify([somar(null), somar({valor: 2, esq: {valor: 3}, dir: {valor: 5, esq: {valor: 7}}})]));"), [0, 17]);

  assert.match(read('course-src/starters/09.02/main.js'), /valor >= 0/);
  assert.deepEqual(lastJson("import {criarConta} from './course-src/solutions/09.02/main.js'; const c = criarConta(2); console.log(JSON.stringify({zero: c.depositar(0), saldo: c.consultar()}));"), {zero: false, saldo: 2});

  assert.doesNotMatch(read('course-src/starters/10.02/main.js'), /Math\.max/);
  assert.equal(lastJson("import {Cofre} from './course-src/solutions/10.02/main.js'; console.log(JSON.stringify(new Cofre(-4).saldo));"), 0);
});

test('07.06 starter and solution preserve zero, special keys and a normal prototype', () => {
  const inspect = path => lastJson(`import {resumirPorCategoria} from '${path}'; const r = resumirPorCategoria([{categoria: 'brinde', preco: 0}, {categoria: 'toString', preco: 2}, {categoria: '__proto__', preco: 3}, {categoria: 'toString', preco: 5}]); console.log(JSON.stringify({zero: r.brinde, toString: Object.getOwnPropertyDescriptor(r, 'toString')?.value, proto: Object.getOwnPropertyDescriptor(r, '__proto__')?.value, keys: Object.keys(r), normal: Object.getPrototypeOf(r) === Object.prototype}));`);
  const expected = {zero: 0, toString: 7, proto: 3, keys: ['brinde', 'toString', '__proto__'], normal: true};
  assert.deepEqual(inspect('./course-src/starters/07.06/main.js'), expected);
  assert.deepEqual(inspect('./course-src/solutions/07.06/main.js'), expected);
});

test('08.01 starter has eight blank predictions and the solution/test use O(1) médio', () => {
  const starter = read('course-src/starters/08.01/main.js');
  assert.equal((starter.match(/crescimento: ""/g) || []).length, 8);
  assert.match(read('course-src/solutions/08.01/main.js'), /O\(1\) médio/);
  assert.match(read('course-src/tests/08.01.test.js'), /O\(1\) médio/);
  const ordens = lastJson("import {analises} from './course-src/solutions/08.01/main.js'; console.log(JSON.stringify(analises.map(item => item.crescimento)));");
  assert.equal(ordens.length, 8);
  assert.equal(ordens[6], 'O(1) médio');
});

test('08.04 starter contains the three published snippets and the half-open invariant', () => {
  const lesson = item('08.04');
  const starter = lesson.starterFiles[0].content;
  assert.equal(lesson.kind, 'READ');
  assert.match(starter, /buscaBinaria/);
  assert.match(starter, /prefixo/);
  assert.match(starter, /parComSoma/);
  assert.match(JSON.stringify([lesson.prompt, lesson.edgeCases]), /\[inicio,fim\)/);
});

test('08.07 returns null for an unreachable destination and tests that contract', () => {
  assert.match(read('course-src/starters/08.07/main.js'), /caminho: caminho\[0\] === inicio \? caminho : null/);
  assert.match(read('course-src/solutions/08.07/main.js'), /caminho: caminho\[0\] === inicio \? caminho : null/);
  assert.match(read('course-src/tests/08.07.test.js'), /destino ausente/);
  assert.deepEqual(lastJson("import {tracarBfs} from './course-src/solutions/08.07/main.js'; const grafo = new Map([['A', ['B']], ['B', []]]); console.log(JSON.stringify(tracarBfs(grafo, 'A', 'X')));"), {ordem: ['A', 'B'], caminho: null});
});

test('09.01 publishes the four bindings and 09.02 rejects zero', () => {
  assert.deepEqual(lastJson("import {tracarEscopo} from './course-src/solutions/09.01/main.js'; console.log(JSON.stringify(tracarEscopo()));"), {fora: 1, bloco: 2, dentro: 3, soma: 6});
  assert.match(JSON.stringify(item('09.04').examples), /criarContadores\(\).*a:1,b:0/);
  assert.deepEqual(lastJson("import {criarContadores} from './course-src/solutions/09.04/main.js'; console.log(JSON.stringify(criarContadores()));"), {a: 1, b: 0});
});

test('09.08 prompt repeats the four observable-store edge cases', () => {
  const prompt = item('09.08').prompt;
  assert.match(prompt, /Object\.is/);
  assert.match(prompt, /idempotente/);
  assert.match(prompt, /durante a emissão/);
  assert.match(prompt, /isoladas/);
});

test('10.03 uses Object.hasOwn and 10.04 publishes Portuguese edge cases', () => {
  const testSource = read('course-src/tests/10.03.test.js');
  assert.match(testSource, /Object\.hasOwn\(a, "mover"\)/);
  assert.doesNotMatch(testSource, /\.hasOwnProperty\(/);
  assert.doesNotMatch(JSON.stringify(item('10.03').edgeCases), /hasOwnProperty/);
  const edgeCases = JSON.stringify(item('10.04').edgeCases);
  assert.match(edgeCases, /primeiras chamadas/);
  assert.match(edgeCases, /após a reatribuição/);
  assert.doesNotMatch(edgeCases, /first calls|calls after/);
});

test('10.06 starter has a real hierarchy while the solution stays pure', () => {
  const starter = read('course-src/starters/10.06/main.js');
  for (const className of ['Personagem', 'Mago', 'Guerreiro', 'MagoGuerreiro']) assert.match(starter, new RegExp(`class ${className}`));
  const inspect = path => lastJson(`import {mover} from '${path}'; const original = {nome: 'Mira', vida: 5, x: 0}; const movido = mover(original, 3); console.log(JSON.stringify({same: original === movido, x: original.x, movidoX: movido.x}));`);
  assert.deepEqual(inspect('./course-src/starters/10.06/main.js'), {same: true, x: 3, movidoX: 3});
  assert.deepEqual(inspect('./course-src/solutions/10.06/main.js'), {same: false, x: 0, movidoX: 3});
});

test('06.08 tests and solution cover missing audio and textual version defaults', () => {
  const testSource = read('course-src/tests/06.08.test.js');
  assert.match(testSource, /"version":2,"audio":null/);
  assert.match(testSource, /"version":"2"/);
  assert.deepEqual(lastJson("import {migrar} from './course-src/solutions/06.08/main.js'; console.log(JSON.stringify([migrar('{\"version\":2}'), migrar('{\"version\":2,\"audio\":null}'), migrar('{\"version\":\"2\"}')]));"), [
    {version: 2, audio: {volume: 50}},
    {version: 2, audio: {volume: 50}},
    {version: 2, audio: {volume: 50}},
  ]);
});

test('07.10 solution and prompt use status ativo instead of the old cancelado field', () => {
  const solution = read('course-src/solutions/07.10/main.js');
  assert.match(solution, /pedido\.status === "ativo"/);
  assert.doesNotMatch(solution, /cancelado\?/);
  assert.match(item('07.10').prompt, /status 'ativo'/);
});

test('changed starters have a new manifest version', () => {
  const manifest = JSON.parse(read('course-src/starters/manifest.json'));
  for (const id of ['07.06', '08.01', '08.04', '08.07', '09.01', '10.06']) assert.equal(manifest[id].version, 3, id);
});
