import { clamp } from './clamp.js';
describe('clamp', () => {
  test('regressão abaixo do mínimo', () => { /*@case 13.07.regressao-abaixo-do-minimo-dd46aec4*/expect(clamp(-5, 0, 10)).toBe(0); });
  test('limita acima e preserva interior/limites', () => { /*@case 13.07.limita-acima-e-preserva-inte-389bd731*/expect(clamp(15, 0, 10)).toBe(10); /*@case 13.07.limita-acima-e-preserva-inte-b2deba24*/expect(clamp(5, 0, 10)).toBe(5); /*@case 13.07.limita-acima-e-preserva-inte-e4179200*/expect(clamp(0, 0, 10)).toBe(0); /*@case 13.07.limita-acima-e-preserva-inte-12d6a9bc*/expect(clamp(10, 0, 10)).toBe(10); });
  test('rejeita intervalo invertido', () => { /*@case 13.07.rejeita-intervalo-invertido-e890849c*/expect(() => clamp(1, 10, 0)).toThrow(RangeError); });
});
