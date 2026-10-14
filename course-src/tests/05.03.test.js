import {slug} from './main.js';

test('normaliza caixa e espaços para montar um slug', () => {
  /*@case 05.03.normaliza-caixa-e-espacos-pa-2c16f717*/expect(slug('  Dragão   Azul ')).toBe('dragão-azul');
  /*@case 05.03.normaliza-caixa-e-espacos-pa-9b5b332a*/expect(slug('A B')).toBe('a-b');
});

test('texto vazio permanece vazio após remover espaços', () => {
  /*@case 05.03.texto-vazio-permanece-vazio--85f5aee9*/expect(slug('   ')).toBe('');
});
