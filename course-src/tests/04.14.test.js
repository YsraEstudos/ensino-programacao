import {criarPedido, saudar, somarTudo} from './main.js';

describe('parâmetros padrão', () => {
  test('usa o padrão só quando o argumento é undefined', () => {
    /*@case 04.14.usa-o-padrao-so-quando-o-arg-e24fec89*/expect(saudar()).toBe('Olá, visitante!');
    /*@case 04.14.usa-o-padrao-so-quando-o-arg-2b8711c8*/expect(saudar(undefined, 'Oi')).toBe('Oi, visitante!');
    /*@case 04.14.usa-o-padrao-so-quando-o-arg-d457b09a*/expect(saudar('Ana')).toBe('Olá, Ana!');
    /*@case 04.14.usa-o-padrao-so-quando-o-arg-8a9a4530*/expect(saudar(null)).toBe('Olá, null!');
  });
  test('preserva valores falsy que não são undefined', () => {
    /*@case 04.14.preserva-valores-falsy-que-n-a1a8bb03*/expect(criarPedido('caneca', 0)).toEqual({item: 'caneca', quantidade: 0, desconto: 0});
  });
  test('preenche só o parâmetro omitido', () => {
    /*@case 04.14.preenche-so-o-parametro-omit-18fd3838*/expect(criarPedido('caneca')).toEqual({item: 'caneca', quantidade: 1, desconto: 0});
    /*@case 04.14.preenche-so-o-parametro-omit-ff8a8f98*/expect(criarPedido('caneca', undefined, 10)).toEqual({item: 'caneca', quantidade: 1, desconto: 10});
  });
});

describe('rest', () => {
  test('reúne os argumentos extras em um array', () => {
    /*@case 04.14.reune-os-argumentos-extras-e-708fc111*/expect(somarTudo()).toBe(0);
    /*@case 04.14.reune-os-argumentos-extras-e-f8cd5ece*/expect(somarTudo(1, 2, 3)).toBe(6);
  });
});
