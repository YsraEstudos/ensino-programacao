import {taxaDeEntrega} from './main.js';

describe('taxaDeEntrega', () => {
  test('retorna a taxa das opções conhecidas', () => {
    /*@case 04.13.retorna-a-taxa-das-opcoes-co-9dc786a4*/expect(taxaDeEntrega('comum')).toBe(0.1);
    /*@case 04.13.retorna-a-taxa-das-opcoes-co-8a328044*/expect(taxaDeEntrega('expressa')).toBe(0.25);
  });

  test('retorna null para opção desconhecida e lança para argumento inválido', () => {
    /*@case 04.13.retorna-null-para-opcao-desc-98391a32*/expect(taxaDeEntrega('noturna')).toBe(null);
    /*@case 04.13.retorna-null-para-opcao-desc-ecdde7eb*/expect(() => taxaDeEntrega('')).toThrow(TypeError);
    /*@case 04.13.retorna-null-para-opcao-desc-c8775a5b*/expect(() => taxaDeEntrega(4)).toThrow(TypeError);
  });
});
