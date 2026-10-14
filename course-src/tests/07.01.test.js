import {classificarIntencoes} from './main.js';

test('operações correspondem aos formatos de saída na tabela pública', () => {
  /*@case 07.01.operacoes-correspondem-aos-f-150c36a6*/expect(classificarIntencoes()).toEqual(['map', 'filter', 'find', 'some', 'every', 'reduce', 'map', 'filter', 'find', 'some', 'every', 'reduce']);
});
