import { paginar } from './pagination.js';

describe('paginar', () => {
  it('retorna páginas completas e parciais sem alterar a entrada', () => {
    const items = [1, 2, 3, 4, 5];
    expect(paginar(items, 1, 2)).toEqual([1, 2]);
    expect(paginar(items, 2, 2)).toEqual([3, 4]);
    expect(paginar(items, 3, 2)).toEqual([5]);
    expect(paginar(items, 4, 2)).toEqual([]);
    expect(items).toEqual([1, 2, 3, 4, 5]);
  });
  it('rejeita página e tamanho fora do contrato', () => {
    for (const [page, size] of [[0, 2], [-1, 2], [1.5, 2], [1, 0], [1, -2], [1, 2.5]]) {
      expect(() => paginar([1], page, size)).toThrow(RangeError);
    }
  });
  it('devolve lista vazia para coleção vazia e página além do fim', () => {
    expect(paginar([], 1, 3)).toEqual([]);
    expect(paginar(['a', 'b'], 3, 1)).toEqual([]);
  });
});
