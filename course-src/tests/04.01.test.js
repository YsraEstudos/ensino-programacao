import {preverRetornos} from './main.js';

test('distingue retorno explícito, undefined e chamada de arrow', () => {
  /*@case 04.01.distingue-retorno-explicito--5dfb26ab*/expect(preverRetornos()).toEqual({a: 2, b: undefined, c: 6, dPositivo: 4, dNegativo: undefined, e: null, f: undefined, g: 2, h: undefined});
});
