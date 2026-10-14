import {criarContadores} from './main.js';

test('cada chamada da factory cria seu próprio binding fechado', () => {
  /*@case 09.04.cada-chamada-da-factory-cria-1c9845a5*/expect(criarContadores()).toEqual({a: 1, b: 0});
});
