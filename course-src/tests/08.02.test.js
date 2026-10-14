import {somar} from './main.js';

test('soma os valores de uma árvore binária e aceita ramo ausente', () => {
  /*@case 08.02.soma-os-valores-de-uma-arvor-ce426836*/expect(somar({valor: 2, esq: {valor: 3}, dir: {valor: 5, esq: {valor: 7}}})).toBe(17);
  /*@case 08.02.soma-os-valores-de-uma-arvor-bf3b14c9*/expect(somar(null)).toBe(0);
});
