import {calcularFrete} from './main.js';

test('calcula frete comum e expresso', () => {
  /*@case 22.11.calcula-frete-comum-e-expres-08070a9c*/expect(calcularFrete(2)).toBe(16);
  /*@case 22.11.calcula-frete-comum-e-expres-fa99e534*/expect(calcularFrete(2, true)).toBe(20);
});

test('rejeita peso inválido antes de calcular', () => {
  /*@case 22.11.rejeita-peso-invalido-antes--1ca9f860*/expect(() => calcularFrete(0)).toThrow(RangeError);
  /*@case 22.11.rejeita-peso-invalido-antes--0e2f8695*/expect(() => calcularFrete(Number.NaN)).toThrow(RangeError);
  /*@case 22.11.rejeita-peso-invalido-antes--d3f6725d*/expect(() => calcularFrete(Number.POSITIVE_INFINITY)).toThrow(RangeError);
});
