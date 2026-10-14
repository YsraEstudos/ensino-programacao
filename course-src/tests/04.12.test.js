import {lerJsonSeguro} from './main.js';

describe('lerJsonSeguro', () => {
  test('interpreta JSON válido e libera o recurso uma vez', () => {
    let liberacoes = 0;
    /*@case 04.12.interpreta-json-valido-e-lib-4cbdaa16*/expect(lerJsonSeguro(() => '{"ativo":true}', () => liberacoes++)).toEqual({ativo: true});
    /*@case 04.12.interpreta-json-valido-e-lib-bd421fed*/expect(liberacoes).toBe(1);
  });

  test('acrescenta contexto à sintaxe inválida e sempre libera', () => {
    let liberacoes = 0;
    let mensagemOriginal;
    try { JSON.parse('{'); } catch (erro) { mensagemOriginal = erro.message; }
    let recebido;
    try { lerJsonSeguro(() => '{', () => liberacoes++); } catch (error) { recebido = error; }
    /*@case 04.12.acrescenta-contexto-a-sintax-4e57d1f4*/expect(recebido).toBeInstanceOf(Error);
    /*@case 04.12.acrescenta-contexto-a-sintax-12c85810*/expect(recebido.message).toBe(`JSON inválido: ${mensagemOriginal}`);
    /*@case 04.12.acrescenta-contexto-a-sintax-1a5112e1*/expect(liberacoes).toBe(1);
  });

  test('preserva erro de leitura e libera mesmo quando ela falha', () => {
    const falha = new Error('disco indisponível');
    let liberacoes = 0;
    let recebido;
    try { lerJsonSeguro(() => { throw falha; }, () => liberacoes++); } catch (error) { recebido = error; }
    /*@case 04.12.preserva-erro-de-leitura-e-l-67612ba5*/expect(recebido).toBe(falha);
    /*@case 04.12.preserva-erro-de-leitura-e-l-f9aa84fe*/expect(liberacoes).toBe(1);
  });
});
