import {Conta} from './main.js';

describe('marca privada com #saldo in valor', () => {
  test('reconhece instâncias reais de Conta', () => {
    /*@case 10.10.reconhece-instancias-reais-d-aaceaa02*/expect(Conta.ehConta(new Conta())).toBe(true);
  });
  test('recusa um objeto com o mesmo formato, mas sem a marca', () => {
    /*@case 10.10.recusa-um-objeto-com-o-mesmo-4f3753b7*/expect(Conta.ehConta({saldo: 10})).toBe(false);
  });
  test('não se deixa enganar pelo prototype', () => {
    /*@case 10.10.nao-se-deixa-enganar-pelo-pr-2306d162*/expect(Conta.ehConta(Object.create(Conta.prototype))).toBe(false);
  });
  test('trata valores que não são objetos sem lançar erro', () => {
    /*@case 10.10.trata-valores-que-nao-sao-ob-4432df31*/expect(Conta.ehConta(null)).toBe(false);
    /*@case 10.10.trata-valores-que-nao-sao-ob-d410d9cd*/expect(Conta.ehConta(5)).toBe(false);
    /*@case 10.10.trata-valores-que-nao-sao-ob-65fe0d5f*/expect(Conta.ehConta('conta')).toBe(false);
  });
  test('depositar acumula o saldo', () => {
    /*@case 10.10.depositar-acumula-o-saldo-564c5ccf*/expect(new Conta().depositar(10).depositar(5).saldo).toBe(15);
  });
});
