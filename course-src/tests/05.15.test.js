import {contarGraficos} from './main.js';

describe('conta grafemas', () => {
  test('caracteres simples contam um grafema cada', () => {
    /*@case 05.15.caracteres-simples-contam-um-6f5ab227*/expect(contarGraficos('abc')).toBe(3);
    /*@case 05.15.caracteres-simples-contam-um-702da744*/expect(contarGraficos('')).toBe(0);
  });
  test('acento decomposto conta como um grafema', () => {
    /*@case 05.15.acento-decomposto-conta-como-17ccf4a8*/expect(contarGraficos('e\u0301')).toBe(1);
  });
  test('bandeira conta como um grafema', () => {
    /*@case 05.15.bandeira-conta-como-um-grafe-73d25a2f*/expect(contarGraficos('🇧🇷')).toBe(1);
  });
});
