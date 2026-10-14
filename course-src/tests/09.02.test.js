import {criarConta} from './main.js';

test('factory mantém saldo privado por conta e retorna operações', () => {
  const a = criarConta(2);
  const b = criarConta(10);
  /*@case 09.02.factory-mantem-saldo-privado-f4aee307*/expect(a.consultar()).toBe(2);
  /*@case 09.02.factory-mantem-saldo-privado-ed6d0009*/expect(a.depositar(3)).toBe(true);
  /*@case 09.02.factory-mantem-saldo-privado-90b15d09*/expect(a.consultar()).toBe(5);
  /*@case 09.02.factory-mantem-saldo-privado-da1c6257*/expect(b.consultar()).toBe(10);
});

test('depósito inválido não altera o saldo', () => {
  const conta = criarConta(2);
  /*@case 09.02.deposito-invalido-nao-altera-24b42a81*/expect(conta.depositar(0)).toBe(false);
  /*@case 09.02.deposito-invalido-nao-altera-33b92d9f*/expect(conta.depositar(-1)).toBe(false);
  /*@case 09.02.deposito-invalido-nao-altera-aaeb617f*/expect(conta.consultar()).toBe(2);
});
