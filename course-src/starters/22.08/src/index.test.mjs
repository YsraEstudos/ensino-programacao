import {test} from 'node:test';
import assert from 'node:assert/strict';
import {centavosParaTexto, somarCentavos} from './index.js';

test('formata BRL e USD', () => {
  assert.equal(centavosParaTexto(1990), 'R$ 19,90');
  assert.equal(centavosParaTexto(100, 'USD'), 'US$ 1,00');
});

test('soma centavos seguros e rejeita frações e overflow', () => {
  assert.equal(somarCentavos([100, 250]), 350);
  assert.throws(() => somarCentavos([1.5]), RangeError);
  assert.throws(() => somarCentavos([Number.MAX_SAFE_INTEGER, 1]), RangeError);
});
