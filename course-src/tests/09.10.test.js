import {criarMemo, obterOuCalcular} from './main.js';

describe('memoização com getOrInsertComputed', () => {
  test('calcula cada chave uma única vez', () => {
    let chamadas = 0;
    const dobro = criarMemo(n => {
      chamadas += 1;
      return n * 2;
    });
    /*@case 09.10.calcula-cada-chave-uma-unica-f8d2d1e2*/expect(dobro(4)).toBe(8);
    /*@case 09.10.calcula-cada-chave-uma-unica-f8d2d1e2*/expect(dobro(4)).toBe(8);
    /*@case 09.10.calcula-cada-chave-uma-unica-9123794b*/expect(dobro(5)).toBe(10);
    /*@case 09.10.calcula-cada-chave-uma-unica-0f37a0fd*/expect(chamadas).toBe(2);
  });
  test('guarda resultados falsy sem recalcular', () => {
    let chamadas = 0;
    const zero = criarMemo(() => {
      chamadas += 1;
      return 0;
    });
    /*@case 09.10.guarda-resultados-falsy-sem--fa30e258*/expect(zero('a')).toBe(0);
    /*@case 09.10.guarda-resultados-falsy-sem--fa30e258*/expect(zero('a')).toBe(0);
    /*@case 09.10.guarda-resultados-falsy-sem--236d2b67*/expect(chamadas).toBe(1);
  });
  test('não roda a fábrica quando a chave já existe', () => {
    const mapa = new Map([['x', 'guardado']]);
    let rodou = false;
    /*@case 09.10.nao-roda-a-fabrica-quando-a--56195e4b*/expect(obterOuCalcular(mapa, 'x', () => {
      rodou = true;
      return 'novo';
    })).toBe('guardado');
    /*@case 09.10.nao-roda-a-fabrica-quando-a--664214d9*/expect(rodou).toBe(false);
  });
  test('o caminho sem getOrInsertComputed calcula uma vez e reaproveita', () => {
    const mapa = new Map();
    mapa.getOrInsertComputed = undefined;
    let chamadas = 0;
    const fabrica = () => {
      chamadas += 1;
      return 'pronto';
    };
    /*@case 09.10.o-caminho-sem-getorinsertcom-0097f3cf*/expect(obterOuCalcular(mapa, 'k', fabrica)).toBe('pronto');
    /*@case 09.10.o-caminho-sem-getorinsertcom-0097f3cf*/expect(obterOuCalcular(mapa, 'k', fabrica)).toBe('pronto');
    /*@case 09.10.o-caminho-sem-getorinsertcom-2abd45e7*/expect(chamadas).toBe(1);
  });
});
