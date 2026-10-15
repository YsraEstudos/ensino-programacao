import { test } from 'node:test';
import assert from 'node:assert/strict';
import { relatorioMultas } from '../src/relatorio.js';

const emprestimo = (id, diasAtraso) => ({ id, diasAtraso });

test('sem atraso não entra no relatório', () => {
  assert.deepEqual(relatorioMultas([emprestimo('a', 0)]), { linhas: [], totalCentavos: 0 });
});

test('multa começa depois da carência e cresce por dia', () => {
  assert.equal(relatorioMultas([emprestimo('a', 5)]).linhas[0].multaCentavos, 150);
});

test('o total soma as linhas', () => {
  assert.equal(relatorioMultas([emprestimo('a', 3), emprestimo('b', 4)]).totalCentavos, 150);
});

test('devolução no último dia da carência não entra no relatório', () => {
  assert.deepEqual(relatorioMultas([emprestimo('a', 2)]).linhas, []);
});
