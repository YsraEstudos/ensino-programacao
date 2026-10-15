import assert from 'node:assert/strict';
import test from 'node:test';
import { executarComPilha, falhasSuprimidas } from './recursos.mjs';

test('a pilha descarta os recursos em ordem inversa, depois do trabalho', () => {
  assert.deepEqual(executarComPilha(['A', 'B'], []), ['trabalho', 'fechou B', 'fechou A']);
});

test('SuppressedError preserva a falha do descarte e a falha original', () => {
  assert.deepEqual(falhasSuprimidas(), {
    nome: 'SuppressedError',
    descarte: 'falha ao fechar',
    original: 'falha do trabalho',
  });
});
