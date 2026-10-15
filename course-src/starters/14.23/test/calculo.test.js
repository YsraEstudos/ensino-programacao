import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularMedia } from '../src/calculo.js';

test('média de duas notas', () => {
  assert.equal(calcularMedia([6, 8]), 7);
});

test('lista vazia tem média zero', () => {
  assert.equal(calcularMedia([]), 0);
});
