import {observarReferencias} from './main.js';

test('alias e cópia rasa compartilham referências em pontos diferentes', () => {
  const estado = observarReferencias();
  /*@case 05.01.alias-e-copia-rasa-compartil-2b0836e3*/expect(estado.a).toEqual([1, 2]);
  /*@case 05.01.alias-e-copia-rasa-compartil-3d8336ed*/expect(estado.b).toEqual([1, 2]);
  /*@case 05.01.alias-e-copia-rasa-compartil-d92c999c*/expect(estado.c).toEqual([1, 2]);
  /*@case 05.01.alias-e-copia-rasa-compartil-27a381f6*/expect(estado.mesmaRaiz).toBe(true);
  /*@case 05.01.alias-e-copia-rasa-compartil-0558a1a0*/expect(estado.copiaIndependente).toBe(true);
});
