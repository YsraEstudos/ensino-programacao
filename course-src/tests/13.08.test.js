import { clamp, unique, paginar } from './library.js';
describe('library', () => {
  test('clamp cobre limites', () => { /*@case 13.08.clamp-cobre-limites-a567f794*/expect(clamp(-1, 0, 4)).toBe(0); /*@case 13.08.clamp-cobre-limites-ddd2dd17*/expect(clamp(5, 0, 4)).toBe(4); });
  test('unique preserva ordem e SameValueZero', () => { /*@case 13.08.unique-preserva-ordem-e-same-dee7df22*/expect(unique([NaN, 1, NaN, 1, 0, -0])).toEqual([NaN, 1, 0]); });
  test('paginar valida e não muta', () => { const values = [1, 2, 3]; /*@case 13.08.paginar-valida-e-nao-muta-dd47871c*/expect(paginar(values, 2, 2)).toEqual([3]); /*@case 13.08.paginar-valida-e-nao-muta-1df0f294*/expect(values).toEqual([1, 2, 3]); /*@case 13.08.paginar-valida-e-nao-muta-23095749*/expect(() => paginar(values, 0, 2)).toThrow(RangeError); });
});
