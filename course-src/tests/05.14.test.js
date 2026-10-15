import {parsearLinhaCsv} from './main.js';

describe('parsearLinhaCsv', () => {
  test('separa campos simples pela vírgula', () => {
    /*@case 05.14.separa-campos-simples-pela-v-730b442c*/expect(parsearLinhaCsv('ana,recife,10')).toEqual(['ana', 'recife', '10']);
  });

  test('mantém vírgula dentro de campo entre aspas', () => {
    /*@case 05.14.mantem-virgula-dentro-de-cam-99be9dee*/expect(parsearLinhaCsv('ana,"Rua A, 10",recife')).toEqual(['ana', 'Rua A, 10', 'recife']);
  });

  test('converte aspas duplicadas no conteúdo do campo', () => {
    /*@case 05.14.converte-aspas-duplicadas-no-28393ac1*/expect(parsearLinhaCsv('"O ""Guia"", A",Santos')).toEqual(['O "Guia", A', 'Santos']);
  });

  test('rejeita campo entre aspas sem fechamento', () => {
    /*@case 05.14.rejeita-campo-entre-aspas-se-5d140e1d*/expect(() => parsearLinhaCsv('ana,"Rua A, 10')).toThrow(SyntaxError);
  });
});
