import {resumirPorCategoria} from './main.js';

test('agrupar e somar por categoria preserva acumulados independentes', () => {
  const itens = [
    {categoria: 'A', preco: 2},
    {categoria: 'A', preco: 3},
    {categoria: 'B', preco: 4},
  ];
  /*@case 07.06.agrupar-e-somar-por-categori-88ba5a20*/expect(resumirPorCategoria(itens)).toEqual({A: 5, B: 4});
  /*@case 07.06.agrupar-e-somar-por-categori-09f8f9af*/expect(itens).toEqual([
    {categoria: 'A', preco: 2},
    {categoria: 'A', preco: 3},
    {categoria: 'B', preco: 4},
  ]);
});

test('uma categoria com preço zero continua presente', () => {
  /*@case 07.06.uma-categoria-com-preco-zero-9b6c667d*/expect(resumirPorCategoria([{categoria: 'brinde', preco: 0}])).toEqual({brinde: 0});
});
