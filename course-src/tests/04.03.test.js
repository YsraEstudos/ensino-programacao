import {exibir} from './main.js';

test('composição converte Celsius e formata a unidade antes de exibir', () => {
  /*@case 04.03.composicao-converte-celsius--12d6744d*/expect(exibir(0)).toBe('32 °F');
  /*@case 04.03.composicao-converte-celsius--ef9a022d*/expect(exibir(100)).toBe('212 °F');
});
