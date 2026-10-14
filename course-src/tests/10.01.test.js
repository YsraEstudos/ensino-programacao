import {compararThis} from './main.js';

test('this de método acompanha o call site e arrow conserva o contexto léxico', () => {
  /*@case 10.01.this-de-metodo-acompanha-o-c-24bd70c9*/expect(compararThis()).toEqual({metodo: 2, call: 7, solto: 'TypeError', arrowCall: 'undefined'});
});
