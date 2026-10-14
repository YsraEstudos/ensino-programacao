import { validar } from './validate.js';

describe('validar', () => {
  test('normaliza nome e quantidade inteira positiva', () => {
    /*@case 11.03.normaliza-nome-e-quantidade--6ef63734*/expect(validar({ nome: ' Ana ', quantidade: '3' })).toEqual({ ok: true, nome: 'Ana', quantidade: 3 });
  });
  test('rejeita nome vazio sem apagar entrada', () => {
    const result = validar({ nome: '  ', quantidade: '2' });
    /*@case 11.03.rejeita-nome-vazio-sem-apaga-782bc542*/expect(result.ok).toBe(false);
    /*@case 11.03.rejeita-nome-vazio-sem-apaga-46dede5a*/expect(result.erros.nome).toBeTruthy();
    /*@case 11.03.rejeita-nome-vazio-sem-apaga-5587beeb*/expect(result.valores.nome).toBe('  ');
  });
  test('rejeita decimal, zero e texto', () => {
    for (const quantidade of ['2.5', '0', 'abc']) {
      const result = validar({ nome: 'Ana', quantidade });
      /*@case 11.03.rejeita-decimal-zero-e-texto-7d387cac*/expect(result.ok).toBe(false);
      /*@case 11.03.rejeita-decimal-zero-e-texto-9e24014e*/expect(result.erros.quantidade).toBeTruthy();
      /*@case 11.03.rejeita-decimal-zero-e-texto-00d86797*/expect(result.valores.quantidade).toBe(quantidade);
    }
  });
  test('preserva valor de edição quando há múltiplos erros', () => {
    const entrada = { nome: '', quantidade: '2x' };
    /*@case 11.03.preserva-valor-de-edicao-qua-6e013b44*/expect(validar(entrada).valores).toEqual(entrada);
  });
});
