import {rotuloItens, tempoRelativo} from './main.js';

describe('rótulo com plural pelo idioma', () => {
  test('singular para a categoria one e plural para as demais', () => {
    /*@case 12.20.singular-para-a-categoria-on-80567c5e*/expect(rotuloItens(1)).toBe('1 item');
    /*@case 12.20.singular-para-a-categoria-on-fe55eefd*/expect(rotuloItens(5)).toBe('5 itens');
  });
});

describe('tempo relativo', () => {
  test('ontem, hoje e amanhã com numeric auto', () => {
    /*@case 12.20.ontem-hoje-e-amanha-com-nume-920e6425*/expect(tempoRelativo(-1)).toBe('ontem');
    /*@case 12.20.ontem-hoje-e-amanha-com-nume-43550526*/expect(tempoRelativo(0)).toBe('hoje');
    /*@case 12.20.ontem-hoje-e-amanha-com-nume-386e3f46*/expect(tempoRelativo(1)).toBe('amanhã');
  });
  test('datas mais distantes usam número', () => {
    /*@case 12.20.datas-mais-distantes-usam-nu-4b19ef21*/expect(tempoRelativo(-3)).toBe('há 3 dias');
  });
});
