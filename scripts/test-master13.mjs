import assert from 'node:assert/strict';
import test from 'node:test';
import {boot} from '../course-src/solutions/11.10/main.js';
import {migrarV1ParaV2, carregar as carregarMigrado} from '../course-src/solutions/11.13/migration.js';
import {carregar as carregarParalelo} from '../course-src/solutions/12.03/main.js';
import {criarDashboard} from '../course-src/solutions/12.08/dashboard.js';

function fakeDom() {
  const list = {children: [], replaceChildren(...children) { this.children = children; }};
  return {
    list,
    document: {createElement(tagName) { return {tagName, textContent: ''}; }},
  };
}

test('11.10 boot carrega estado vazio ou salvo e renderiza texto literal', () => {
  const {document, list} = fakeDom();
  const emptyStorage = {getItem: () => null};
  assert.deepEqual(boot(emptyStorage, document, list), {version: 1, tasks: []});
  assert.equal(list.children.length, 0);

  const saved = {
    getItem: () => JSON.stringify({version: 1, tasks: [{id: 't1', text: '<img src=x>', status: 'todo'}]}),
  };
  assert.deepEqual(boot(saved, document, list).tasks[0].text, '<img src=x>');
  assert.equal(list.children[0].textContent, '<img src=x>');
});

test('11.13 migra V1, mantém registros válidos e sinaliza o parcial', () => {
  const warnings = [];
  const input = {version: 1, tasks: [
    {id: 'ok', text: 'Ler', status: 'todo'},
    {id: 'partial'},
  ]};
  assert.deepEqual(migrarV1ParaV2(input), {version: 2, tasks: [
    {id: 'ok', text: 'Ler', status: 'todo', priority: 'normal'},
  ]});
  assert.equal(carregarMigrado(input, warnings).tasks.length, 1);
  assert.equal(warnings.length, 1);
});

test('12.03 referência inicia operações em paralelo e mantém a ordem de entrada', async () => {
  const pending = new Map();
  const started = [];
  const api = Object.fromEntries(['produtos', 'usuarios', 'precos'].map((name, index) => [name, () => {
    started.push(name);
    return new Promise(resolve => pending.set(name, resolve));
  }]));

  const result = carregarParalelo(api);
  assert.deepEqual(started, ['produtos', 'usuarios', 'precos']);
  pending.get('precos')('R');
  pending.get('usuarios')('U');
  pending.get('produtos')('P');
  assert.deepEqual(await result, ['P', 'U', 'R']);
});

test('12.03 caso incorreto sequencial é distinguido pela verificação de início paralelo', async () => {
  const started = [];
  const deferred = () => new Promise(resolve => setTimeout(resolve, 0));
  const api = Object.fromEntries(['produtos', 'usuarios', 'precos'].map(name => [name, async () => {
    started.push(name);
    await deferred();
    return name;
  }]));
  const sequential = async source => [
    await source.produtos(),
    await source.usuarios(),
    await source.precos(),
  ];

  const result = sequential(api);
  assert.deepEqual(started, ['produtos']);
  assert.notDeepEqual(started, ['produtos', 'usuarios', 'precos']);
  await result;
});

test('12.08 retry e resposta antiga fora de ordem', async () => {
  const pending = [];
  const fetcher = path => new Promise(resolve => pending.push({path, resolve}));
  const older = criarDashboard(fetcher);
  const newer = criarDashboard(fetcher);
  const oldResponses = pending.slice(0, 2);
  const newResponses = pending.slice(2);
  for (const item of newResponses) {
    item.resolve({ok: true, status: 200, json: async () => item.path === '/profile' ? {nome: 'novo'} : {total: 2}});
  }
  assert.equal((await newer).profile.nome, 'novo');
  for (const item of oldResponses) {
    item.resolve({ok: true, status: 200, json: async () => item.path === '/profile' ? {nome: 'antigo'} : {total: 1}});
  }
  assert.deepEqual(await older, {status: 'stale'});
});

test('12.08 retry é uma nova carga e headers são opcionais na fixture', async () => {
  let calls = 0;
  const fetcher = async path => ({
    ok: ++calls !== 1,
    status: calls === 1 ? 503 : 200,
    json: async () => path === '/profile' ? {nome: 'Ana'} : {total: 3},
  });
  assert.equal((await criarDashboard(fetcher)).status, 'error');
  assert.deepEqual(await criarDashboard(fetcher), {
    status: 'success',
    profile: {nome: 'Ana'},
    stats: {total: 3},
  });
});

