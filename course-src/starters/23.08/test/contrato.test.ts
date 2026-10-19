// Contrato local do adapter em memória; a mesma suíte também deve cobrir outros adapters que você criar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criar, mover, remover, estadoInicial } from '../src/dominio.ts';
import { criarRepositorioEmMemoria } from '../src/adapters/memoria.ts';

test('salva e recupera após recriar a referência ao adapter', async () => {
  const repositorio = criarRepositorioEmMemoria();
  const criado = criar(estadoInicial, 't1', 'Estudar');
  await repositorio.salvar(criado);
  const recuperado = await repositorio.carregar();
  assert.deepEqual(recuperado, criado);
});

test('mover e remover preservam a regra do domínio e o estado salvo', async () => {
  const repositorio = criarRepositorioEmMemoria();
  const criado = criar(estadoInicial, 't1', 'Estudar');
  const movido = mover(criado, 't1', 'fazendo');
  assert.equal(criado.tarefas[0]?.coluna, 'a-fazer');
  assert.equal(movido.tarefas[0]?.coluna, 'fazendo');
  await repositorio.salvar(movido);
  assert.deepEqual(await repositorio.carregar(), movido);
  const removido = remover(movido, 't1');
  await repositorio.salvar(removido);
  assert.deepEqual(await repositorio.carregar(), removido);
});

test('entrada inválida e falha de storage preservam o estado anterior', async () => {
  const repositorio = criarRepositorioEmMemoria();
  const criado = criar(estadoInicial, 't1', 'Estudar');
  await repositorio.salvar(criado);
  assert.throws(() => criar(criado, 't2', '   '));
  assert.deepEqual(await repositorio.carregar(), criado);
  repositorio.falharProximo();
  await assert.rejects(repositorio.salvar(remover(criado, 't1')));
  assert.deepEqual(await repositorio.carregar(), criado);
});
