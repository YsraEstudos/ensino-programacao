import { paginar } from './pagination.js';
describe('paginar', () => {
  test('primeira e segunda páginas', () => { /*@case 13.03.primeira-e-segunda-paginas-4f294dd0*/expect(paginar([1, 2, 3], 1, 2)).toEqual([1, 2]); /*@case 13.03.primeira-e-segunda-paginas-73321acf*/expect(paginar([1, 2, 3], 2, 2)).toEqual([3]); });
  test('valida page e size inteiros positivos', () => { /*@case 13.03.valida-page-e-size-inteiros--b0186962*/expect(() => paginar([], 0, 2)).toThrow(RangeError); /*@case 13.03.valida-page-e-size-inteiros--72cecf1c*/expect(() => paginar([], 1, 0)).toThrow(RangeError); /*@case 13.03.valida-page-e-size-inteiros--a6c57b7e*/expect(() => paginar([], 1.5, 2)).toThrow(RangeError); });
  test('além do fim e não mutação', () => { const items = [3, 1, 2]; /*@case 13.03.alem-do-fim-e-nao-mutacao-086d4630*/expect(paginar(items, 9, 2)).toEqual([]); /*@case 13.03.alem-do-fim-e-nao-mutacao-b73b837d*/expect(items).toEqual([3, 1, 2]); });
});
