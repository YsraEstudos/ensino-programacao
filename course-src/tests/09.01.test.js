import {tracarEscopo} from './main.js';

test('closures leem os bindings visíveis durante a execução', () => {
  /*@case 09.01.closures-leem-os-bindings-vi-09d12e22*/expect(tracarEscopo()).toEqual({fora: 1, bloco: 2, dentro: 3, soma: 6});
});
