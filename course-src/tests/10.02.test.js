import {Cofre} from './main.js';

test('classe mantém saldo encapsulado e expõe getter de leitura', () => {
  const cofre = new Cofre(2);
  /*@case 10.02.classe-mantem-saldo-encapsul-bdc170eb*/expect(cofre.saldo).toBe(2);
  /*@case 10.02.classe-mantem-saldo-encapsul-57579c6f*/expect(cofre.depositar(3)).toBe(true);
  /*@case 10.02.classe-mantem-saldo-encapsul-4588a6cd*/expect(cofre.saldo).toBe(5);
  /*@case 10.02.classe-mantem-saldo-encapsul-29c8909e*/expect('#saldo' in cofre).toBe(false);
});

test('saldo nunca fica negativo por construção ou depósito inválido', () => {
  const cofre = new Cofre(-4);
  /*@case 10.02.saldo-nunca-fica-negativo-po-4ce62a78*/expect(cofre.saldo).toBe(0);
  /*@case 10.02.saldo-nunca-fica-negativo-po-b1386e8d*/expect(cofre.depositar(0)).toBe(false);
  /*@case 10.02.saldo-nunca-fica-negativo-po-ff473c17*/expect(cofre.depositar(-2)).toBe(false);
  /*@case 10.02.saldo-nunca-fica-negativo-po-4ce62a78*/expect(cofre.saldo).toBe(0);
});
