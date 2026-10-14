import {criarHandlers} from './main.js';

test('callbacks lembram o índice da própria iteração depois do loop', () => {
  const handlers = criarHandlers(3);
  /*@case 09.05.callbacks-lembram-o-indice-d-34efb9f2*/expect(handlers).toHaveLength(3);
  /*@case 09.05.callbacks-lembram-o-indice-d-3a4c4aff*/expect(handlers.map(handler => handler())).toEqual([0, 1, 2]);
});

test('a quantidade de callbacks acompanha o limite informado', () => {
  /*@case 09.05.a-quantidade-de-callbacks-ac-2611eafb*/expect(criarHandlers(4).map(handler => handler())).toEqual([0, 1, 2, 3]);
  /*@case 09.05.a-quantidade-de-callbacks-ac-93c33972*/expect(criarHandlers(0)).toEqual([]);
});
