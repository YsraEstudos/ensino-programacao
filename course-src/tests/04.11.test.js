import {validarPercentual} from './main.js';

describe('validarPercentual', () => {
  test('retorna percentuais válidos, inclusive os limites', () => {
    /*@case 04.11.retorna-percentuais-validos--484d51b8*/expect(validarPercentual(25)).toBe(25);
    /*@case 04.11.retorna-percentuais-validos--676ae164*/expect(validarPercentual(0)).toBe(0);
    /*@case 04.11.retorna-percentuais-validos--6bdb7a6a*/expect(validarPercentual(100)).toBe(100);
  });

  test('distingue tipo incorreto de valor fora da faixa', () => {
    /*@case 04.11.distingue-tipo-incorreto-de--8efdf819*/expect(() => validarPercentual('25')).toThrow(TypeError);
    for (const valor of [-1, 101, NaN, Infinity]) {
      /*@case 04.11.distingue-tipo-incorreto-de--ca718a69*/expect(() => validarPercentual(valor)).toThrow(RangeError);
    }
  });
});
