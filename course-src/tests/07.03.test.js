import {ranking} from './main.js';

test('pontua partidas válidas e ordena por pontos decrescentes e nome crescente', () => {
  /*@case 07.03.pontua-partidas-validas-e-or-0f2d99dd*/expect(ranking([
    {id: 'x', jogador: 'Bia', valida: true, pontos: 8},
    {id: 'y', jogador: 'Ana', valida: true, pontos: 8},
    {id: 'z', jogador: 'Cris', valida: false, pontos: 20},
  ])).toEqual(['y', 'x']);
  /*@case 07.03.pontua-partidas-validas-e-or-766d8633*/expect(ranking([
    {id: 'top', jogador: 'Zoe', valida: true, pontos: 9},
    {id: 'middle', jogador: 'Ana', valida: true, pontos: 5},
    {id: 'low', jogador: 'Bia', valida: true, pontos: 1},
  ])).toEqual(['top', 'middle', 'low']);
});

test('desempata nomes com acentos segundo a colação pt-BR', () => {
  /*@case 07.03.desempata-nomes-com-acentos--78d10848*/expect(ranking([
    {id: 'bruno', jogador: 'Bruno', valida: true, pontos: 8},
    {id: 'agata', jogador: 'Ágata', valida: true, pontos: 8},
  ])).toEqual(['agata', 'bruno']);
});
