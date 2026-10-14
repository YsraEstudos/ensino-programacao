import {atacar, curar, criarPersonagem, mover} from './main.js';

test('capacidades são compostas por entidade e não criam subclasses por combinação', () => {
  const mago = criarPersonagem({nome: 'Mira', vida: 5, x: 0}, {mover, curar});
  const guerreiro = criarPersonagem({nome: 'Téo', vida: 8, x: 0}, {mover, atacar});

  /*@case 10.06.capacidades-sao-compostas-po-02380f8d*/expect(mago.capacidades.mover).toBe(mover);
  /*@case 10.06.capacidades-sao-compostas-po-1ac110b0*/expect(mago.capacidades.curar).toBe(curar);
  /*@case 10.06.capacidades-sao-compostas-po-88c100a2*/expect('atacar' in mago.capacidades).toBe(false);
  /*@case 10.06.capacidades-sao-compostas-po-110373a8*/expect(guerreiro.capacidades.atacar).toBe(atacar);
  /*@case 10.06.capacidades-sao-compostas-po-dd56b0fe*/expect(guerreiro.capacidades.curar).toBe(undefined);
});

test('funções de capacidade compartilhadas recebem e devolvem estado isolado', () => {
  const original = {nome: 'Mira', vida: 5, x: 0, forca: 1};
  const deslocada = mover(original, 3);
  const curada = curar(original, 2);
  const ferida = atacar(original, {vida: 9});

  /*@case 10.06.funcoes-de-capacidade-compar-f21b0215*/expect(deslocada).toEqual({nome: 'Mira', vida: 5, x: 3, forca: 1});
  /*@case 10.06.funcoes-de-capacidade-compar-71dab4f9*/expect(curada).toEqual({nome: 'Mira', vida: 7, x: 0, forca: 1});
  /*@case 10.06.funcoes-de-capacidade-compar-be009c3b*/expect(ferida).toEqual({vida: 8});
  /*@case 10.06.funcoes-de-capacidade-compar-18f4af5c*/expect(original).toEqual({nome: 'Mira', vida: 5, x: 0, forca: 1});
});
