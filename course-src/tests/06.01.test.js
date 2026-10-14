import {observarAliasing} from './main.js';

test('cópia rasa mantém o objeto aninhado compartilhado', () => {
  /*@case 06.01.copia-rasa-mantem-o-objeto-a-d60061ed*/expect(observarAliasing()).toEqual({pontos: 2, ativo: false, mesmaRaiz: false, mesmoMeta: true});
});
