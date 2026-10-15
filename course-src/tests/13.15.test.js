import {ErroPagamento, ehErro, pagar} from './main.js';

describe('erro de domínio', () => {
  test('cobrança aceita devolve o valor do gateway', () => {
    /*@case 13.15.cobranca-aceita-devolve-o-va-2b31571d*/expect(pagar(10, {cobrar: valor => valor})).toBe(10);
  });
  test('valor não positivo lança ErroPagamento', () => {
    /*@case 13.15.valor-nao-positivo-lanca-err-6510f989*/expect(() => pagar(0, {cobrar: valor => valor})).toThrow(ErroPagamento);
  });
  test('falha do gateway vira ErroPagamento com a causa original', () => {
    const original = new Error('recusado');
    let erro;
    try {
      pagar(5, {cobrar() { throw original; }});
    } catch (falha) {
      erro = falha;
    }
    /*@case 13.15.falha-do-gateway-vira-erropa-1a8ab59e*/expect(erro instanceof ErroPagamento).toBe(true);
    /*@case 13.15.falha-do-gateway-vira-erropa-ffa6ca18*/expect(erro.name).toBe('ErroPagamento');
    /*@case 13.15.falha-do-gateway-vira-erropa-7bbd123b*/expect(erro.cause).toBe(original);
  });
});

describe('ehErro', () => {
  test('reconhece erros reais, inclusive subclasses', () => {
    /*@case 13.15.reconhece-erros-reais-inclus-664ef81f*/expect(ehErro(new Error('x'))).toBe(true);
    /*@case 13.15.reconhece-erros-reais-inclus-f8aeb925*/expect(ehErro(new ErroPagamento('x'))).toBe(true);
  });
  test('não confunde objeto com formato de erro', () => {
    /*@case 13.15.nao-confunde-objeto-com-form-c3a26a18*/expect(ehErro({name: 'Error', message: 'x'})).toBe(false);
  });
});
