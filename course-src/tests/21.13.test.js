import {criarContador, ouvirAte} from './main.js';

describe('contador com eventos', () => {
  test('emite o novo valor a cada incremento', () => {
    const contador = criarContador();
    const valores = [];
    contador.addEventListener('mudou', evento => valores.push(evento.detail.valor));
    contador.incrementar();
    contador.incrementar();
    /*@case 21.13.emite-o-novo-valor-a-cada-in-511c7c6e*/expect(valores).toEqual([1, 2]);
    /*@case 21.13.emite-o-novo-valor-a-cada-in-ded6c3e8*/expect(contador.valor).toBe(2);
  });
});

describe('escuta cancelável', () => {
  test('para de receber eventos depois que o sinal é abortado', () => {
    const contador = criarContador();
    const controle = new AbortController();
    let chamadas = 0;
    ouvirAte(contador, () => { chamadas += 1; }, controle.signal);
    contador.incrementar();
    controle.abort();
    contador.incrementar();
    /*@case 21.13.para-de-receber-eventos-depo-78b1700b*/expect(chamadas).toBe(1);
  });
});
