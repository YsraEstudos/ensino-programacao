import {contarTipos, obterOuInserir} from './main.js';

describe('contagem com getOrInsert', () => {
  test('conta cada tipo a partir de zero', () => {
    const contagem = contarTipos([{tipo: 'livro'}, {tipo: 'filme'}, {tipo: 'livro'}]);
    /*@case 07.14.conta-cada-tipo-a-partir-de--0b18fc90*/expect(Object.fromEntries(contagem)).toEqual({livro: 2, filme: 1});
  });
  test('insere o valor padrão somente quando a chave falta', () => {
    const mapa = new Map([['a', 1]]);
    /*@case 07.14.insere-o-valor-padrao-soment-1a467e7e*/expect(obterOuInserir(mapa, 'a', 99)).toBe(1);
    /*@case 07.14.insere-o-valor-padrao-soment-0fc22447*/expect(obterOuInserir(mapa, 'b', 99)).toBe(99);
    /*@case 07.14.insere-o-valor-padrao-soment-a8a0da4b*/expect(mapa.get('b')).toBe(99);
  });
  test('devolve valores falsy e undefined já guardados sem os substituir', () => {
    const mapa = new Map([['zero', 0], ['vazio', ''], ['indefinido', undefined]]);
    /*@case 07.14.devolve-valores-falsy-e-unde-8f095d30*/expect(obterOuInserir(mapa, 'zero', 5)).toBe(0);
    /*@case 07.14.devolve-valores-falsy-e-unde-5293dc38*/expect(obterOuInserir(mapa, 'vazio', 'x')).toBe('');
    /*@case 07.14.devolve-valores-falsy-e-unde-ec28ef32*/expect(obterOuInserir(mapa, 'indefinido', 'x')).toBe(undefined);
    /*@case 07.14.devolve-valores-falsy-e-unde-92d4d126*/expect(mapa.has('indefinido')).toBe(true);
  });
  test('o caminho sem getOrInsert dá o mesmo resultado', () => {
    const mapa = new Map([['zero', 0]]);
    mapa.getOrInsert = undefined;
    /*@case 07.14.o-caminho-sem-getorinsert-da-ea449ba2*/expect(obterOuInserir(mapa, 'zero', 5)).toBe(0);
    /*@case 07.14.o-caminho-sem-getorinsert-da-68e43450*/expect(obterOuInserir(mapa, 'novo', 7)).toBe(7);
    /*@case 07.14.o-caminho-sem-getorinsert-da-15b707cb*/expect(mapa.get('novo')).toBe(7);
  });
});
