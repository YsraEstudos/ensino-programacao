import {esperar, promisify} from './main.js';

describe('esperar', () => {
  test('resolve com o valor depois do tempo', async () => {
    /*@case 12.17.resolve-com-o-valor-depois-d-7b8978ef*/expect(await esperar(1, 'ok')).toBe('ok');
  });
});

describe('promisify', () => {
  test('resolve com o resultado do callback', async () => {
    const dobro = promisify((x, callback) => callback(null, x * 2));
    /*@case 12.17.resolve-com-o-resultado-do-c-13f44f1b*/expect(await dobro(3)).toBe(6);
  });
  test('rejeita com o erro do callback', async () => {
    const lerNegativo = promisify((x, callback) => callback(new RangeError('negativo')));
    let erro;
    try {
      await lerNegativo(-1);
    } catch (falha) {
      erro = falha;
    }
    /*@case 12.17.rejeita-com-o-erro-do-callba-0703d8a1*/expect(erro instanceof RangeError).toBe(true);
  });
});
