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

test('categorias com nomes herdados conservam seus próprios totais', () => {
  const resultado = resumirPorCategoria([
    {categoria: 'toString', preco: 2},
    {categoria: '__proto__', preco: 3},
    {categoria: 'constructor', preco: 4},
    {categoria: 'toString', preco: 5},
  ]);
  expect(Object.getOwnPropertyDescriptor(resultado, 'toString')?.value).toBe(7);
  expect(Object.getOwnPropertyDescriptor(resultado, '__proto__')?.value).toBe(3);
  expect(Object.getOwnPropertyDescriptor(resultado, 'constructor')?.value).toBe(4);
  expect(Object.keys(resultado)).toEqual(['toString', '__proto__', 'constructor']);
  expect(Object.getPrototypeOf(resultado)).toBe(Object.prototype);
});

test('categorias numérica e textual com a mesma chave continuam somando juntas', () => {
  expect(resumirPorCategoria([
    {categoria: 1, preco: 2},
    {categoria: '1', preco: 3},
  ])).toEqual({'1': 5});
});
