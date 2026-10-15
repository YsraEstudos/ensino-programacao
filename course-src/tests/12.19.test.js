import {lerPagina, montarUrl} from './main.js';

describe('montarUrl', () => {
  test('mantém o prefixo da base e codifica os parâmetros', () => {
    /*@case 12.19.mantem-o-prefixo-da-base-e-c-57b93991*/expect(montarUrl('https://api.exemplo.test/v1/', 'busca', {q: 'café', page: 2})).toBe('https://api.exemplo.test/v1/busca?q=caf%C3%A9&page=2');
  });
  test('espaço vira + na query', () => {
    /*@case 12.19.espaco-vira-na-query-d16040d9*/expect(montarUrl('https://api.exemplo.test/v1/', 'busca', {q: 'a b'})).toBe('https://api.exemplo.test/v1/busca?q=a+b');
  });
});

describe('lerPagina', () => {
  test('lê o número da página da busca', () => {
    /*@case 12.19.le-o-numero-da-pagina-da-bus-9b588652*/expect(lerPagina('https://x.test/busca?page=3')).toBe(3);
  });
  test('usa a primeira página quando o valor é inválido ou ausente', () => {
    /*@case 12.19.usa-a-primeira-pagina-quando-224aab8d*/expect(lerPagina('https://x.test/busca?page=abc')).toBe(1);
    /*@case 12.19.usa-a-primeira-pagina-quando-2020bcc4*/expect(lerPagina('https://x.test/busca')).toBe(1);
  });
  test('URL inválida lança TypeError', () => {
    /*@case 12.19.url-invalida-lanca-typeerror-66461121*/expect(() => lerPagina('não é url')).toThrow(TypeError);
  });
});
