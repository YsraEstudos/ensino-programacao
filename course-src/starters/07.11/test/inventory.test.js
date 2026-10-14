import test from 'node:test';
import assert from 'node:assert/strict';
import {contarItens} from '../src/inventory.js';

test('soma quantidades sem alterar o inventario', () => {
  const items = [{nome: 'pocao', quantidade: 2}, {nome: 'chave', quantidade: 1}];
  assert.equal(contarItens(items), 3);
  assert.deepEqual(items, [{nome: 'pocao', quantidade: 2}, {nome: 'chave', quantidade: 1}]);
});

test('inventario vazio tem zero itens', () => assert.equal(contarItens([]), 0));
