import {estaBemFormado, prepararParaEnvio} from './main.js';

describe('texto UTF-16 bem formado', () => {
  test('aceita par substituto válido e rejeita surrogate isolado', () => {
    /*@case 05.16.aceita-par-substituto-valido-c98bc998*/expect(estaBemFormado('ação 😀')).toBe(true);
    /*@case 05.16.aceita-par-substituto-valido-532812da*/expect(estaBemFormado('a\uD800b')).toBe(false);
  });
  test('envia texto bem formado sem alterar nenhum caractere', () => {
    /*@case 05.16.envia-texto-bem-formado-sem--c08c1c40*/expect(prepararParaEnvio('ação 😀')).toEqual({ok: true, texto: 'ação 😀'});
  });
  test('troca surrogate isolado por U+FFFD e informa a substituição', () => {
    /*@case 05.16.troca-surrogate-isolado-por--1f865676*/expect(prepararParaEnvio('a\uD800b')).toEqual({ok: false, texto: 'a�b'});
    /*@case 05.16.troca-surrogate-isolado-por--30291049*/expect(prepararParaEnvio('x\uDC00')).toEqual({ok: false, texto: 'x�'});
  });
});
