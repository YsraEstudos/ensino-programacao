import {compararMetadados} from './main.js';

test('WeakMap consulta por identidade e não oferece enumeração pública', () => {
  /*@case 09.07.weakmap-consulta-por-identid-56f1f8cd*/expect(compararMetadados()).toEqual({mapTemA: true, weakTemB: true, mapIteravel: true, weakTemSize: false, weakTemIterador: false});
});
