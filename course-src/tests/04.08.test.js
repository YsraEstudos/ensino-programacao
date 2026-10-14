import {custoPeso, custoDistancia, frete} from './main.js';

describe('frete por responsabilidades independentes', () => {
  test('calcula peso e distância separadamente e compõe o total', () => {
    /*@case 04.08.calcula-peso-e-distancia-sep-0082c581*/expect(custoPeso(2)).toBe(4);
    /*@case 04.08.calcula-peso-e-distancia-sep-c5c25566*/expect(custoDistancia(10)).toBe(1);
    /*@case 04.08.calcula-peso-e-distancia-sep-cf9eeea6*/expect(frete(2, 10)).toBe(5);
  });

  test('preserva zero e valores fracionários válidos', () => {
    /*@case 04.08.preserva-zero-e-valores-frac-7adc9d7e*/expect(custoPeso(0)).toBe(0);
    /*@case 04.08.preserva-zero-e-valores-frac-20cf0e30*/expect(custoDistancia(0)).toBe(0);
    /*@case 04.08.preserva-zero-e-valores-frac-605d4704*/expect(frete(0, 0)).toBe(0);
    /*@case 04.08.preserva-zero-e-valores-frac-c2c10c0c*/expect(frete(1.5, 2)).toBe(3.2);
  });
});
