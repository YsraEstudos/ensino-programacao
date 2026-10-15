import {lerIdPreservado, serializarComId, suportaPreservacao} from './main.js';

describe('número grande preservado no JSON', () => {
  test('detecta o suporte nativo e reconhece um runtime sem JSON.rawJSON', () => {
    /*@case 06.12.detecta-o-suporte-nativo-e-r-b0391081*/expect(suportaPreservacao()).toBe(true);
    /*@case 06.12.detecta-o-suporte-nativo-e-r-75a824b1*/expect(suportaPreservacao({parse: JSON.parse, stringify: JSON.stringify})).toBe(false);
  });
  test('lê o id com os dígitos do texto original', () => {
    /*@case 06.12.le-o-id-com-os-digitos-do-te-d75daee9*/expect(lerIdPreservado('{"id":12345678901234567890,"nome":"Ana"}')).toEqual({id: '12345678901234567890', nome: 'Ana'});
  });
  test('preserva a grafia de um número com casas decimais', () => {
    /*@case 06.12.preserva-a-grafia-de-um-nume-c1f993dd*/expect(lerIdPreservado('{"id":1.50,"nome":"Beto"}').id).toBe('1.50');
  });
  test('serializa o id como número cru, sem aspas', () => {
    /*@case 06.12.serializa-o-id-como-numero-c-3e4719f1*/expect(serializarComId({id: '12345678901234567890', nome: 'Ana'})).toBe('{"id":12345678901234567890,"nome":"Ana"}');
  });
  test('ida e volta devolve o mesmo texto', () => {
    const texto = '{"id":9007199254740993,"nome":"Caio"}';
    /*@case 06.12.ida-e-volta-devolve-o-mesmo--bcde8d81*/expect(serializarComId(lerIdPreservado(texto))).toBe(texto);
  });
  test('JSON inválido continua lançando SyntaxError', () => {
    /*@case 06.12.json-invalido-continua-lanca-97804f93*/expect(() => lerIdPreservado('{"id":')).toThrow(SyntaxError);
  });
});
