import {normalizar} from './main.js';

test('normaliza somente os campos permitidos do registro', () => {
  /*@case 06.03.normaliza-somente-os-campos--52db36a3*/expect(normalizar({id: 7, nome: '  Ana  ', senha: 'secreta'})).toEqual({id: 7, nome: 'Ana'});
  /*@case 06.03.normaliza-somente-os-campos--05066a5d*/expect(normalizar({id: 8, nome: 'Bia'})).toEqual({id: 8, nome: 'Bia'});
});
