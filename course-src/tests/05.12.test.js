import {formatarData} from './main.js';

describe('formata datas ISO', () => {
  test('troca AAAA-MM-DD por DD/MM/AAAA', () => {
    /*@case 05.12.troca-aaaa-mm-dd-por-dd-mm-a-2ef6e05c*/expect(formatarData('2026-10-14')).toBe('14/10/2026');
    /*@case 05.12.troca-aaaa-mm-dd-por-dd-mm-a-2cd4bde4*/expect(formatarData('1999-01-02')).toBe('02/01/1999');
  });
  test('não reescreve uma data que aparece dentro de um texto', () => {
    /*@case 05.12.nao-reescreve-uma-data-que-a-8365d508*/expect(formatarData('dia 2026-10-14')).toBe('dia 2026-10-14');
  });
});
