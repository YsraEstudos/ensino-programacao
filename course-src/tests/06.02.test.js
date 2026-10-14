import {observarReferencias} from './main.js';

test('alias modifica a base e spread compartilha os objetos aninhados', () => {
  const estado = observarReferencias();
  /*@case 06.02.alias-modifica-a-base-e-spre-9aa81ed8*/expect(estado.base.usuario.nome).toBe('Bia');
  /*@case 06.02.alias-modifica-a-base-e-spre-4f71f24f*/expect(estado.alias.itens).toEqual([1, 2]);
  /*@case 06.02.alias-modifica-a-base-e-spre-c186aab1*/expect(estado.copia.usuario.nome).toBe('Bia');
  /*@case 06.02.alias-modifica-a-base-e-spre-175380ed*/expect(estado.mesmaRaiz).toBe(false);
  /*@case 06.02.alias-modifica-a-base-e-spre-5dd5f139*/expect(estado.mesmoUsuario).toBe(true);
});
