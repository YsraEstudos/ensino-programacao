import {meuReduce} from './main.js';

describe('acumulador explícito', () => {
  test('soma com valor inicial e com lista vazia', () => {
    /*@case 07.13.soma-com-valor-inicial-e-com-a9537fd3*/expect(meuReduce([1, 2, 3], (acc, n) => acc + n, 0)).toBe(6);
    /*@case 07.13.soma-com-valor-inicial-e-com-7e6cabfe*/expect(meuReduce([], (acc, n) => acc + n, 10)).toBe(10);
  });
  test('sem valor inicial começa no primeiro item', () => {
    /*@case 07.13.sem-valor-inicial-comeca-no--b9f0b2c5*/expect(meuReduce([1, 2, 3], (acc, n) => acc + n)).toBe(6);
  });
  test('passa o índice ao callback', () => {
    /*@case 07.13.passa-o-indice-ao-callback-3e3fa715*/expect(meuReduce(['a', 'b'], (acc, letra, indice) => acc + indice + letra, '')).toBe('0a1b');
  });
  test('lista vazia sem valor inicial é erro explícito', () => {
    /*@case 07.13.lista-vazia-sem-valor-inicia-76b38bc8*/expect(() => meuReduce([], (acc, n) => acc + n)).toThrow(TypeError);
  });
});
