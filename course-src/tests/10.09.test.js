import {criarConta} from './main.js';

describe('saldo com getter e setter', () => {
  test('lê e escreve um saldo válido', () => {
    const conta = criarConta('c1', 10);
    /*@case 10.09.le-e-escreve-um-saldo-valido-b68bb827*/expect(conta.saldo).toBe(10);
    conta.saldo = 25;
    /*@case 10.09.le-e-escreve-um-saldo-valido-1e9c5006*/expect(conta.saldo).toBe(25);
  });
  test('rejeita saldo negativo ao escrever e ao criar', () => {
    const conta = criarConta('c1', 10);
    /*@case 10.09.rejeita-saldo-negativo-ao-es-6f85c05d*/expect(() => { conta.saldo = -1; }).toThrow(RangeError);
    /*@case 10.09.rejeita-saldo-negativo-ao-es-7fe260f3*/expect(() => criarConta('c2', -5)).toThrow(RangeError);
  });
});

describe('id protegido', () => {
  test('id é lido, não aparece nas chaves e não pode ser reescrito', () => {
    const conta = criarConta('c1', 10);
    /*@case 10.09.id-e-lido-nao-aparece-nas-ch-197af051*/expect(conta.id).toBe('c1');
    /*@case 10.09.id-e-lido-nao-aparece-nas-ch-764a59f3*/expect(Object.keys(conta)).toEqual(['saldo']);
    /*@case 10.09.id-e-lido-nao-aparece-nas-ch-1f3982f8*/expect(Reflect.set(conta, 'id', 'c2')).toBe(false);
  });
});
