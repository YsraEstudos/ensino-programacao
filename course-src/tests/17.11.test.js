import {Plano} from './main.ts';

test('Plano implementa a fronteira de capacidade', () => {
  const plano = new Plano('Básico', 100);
  /*@case 17.11.plano-implementa-a-fronteira-9ab67e5b*/expect(plano.podeGuardar(0)).toBe(true);
  /*@case 17.11.plano-implementa-a-fronteira-cbe24028*/expect(plano.podeGuardar(100)).toBe(true);
  /*@case 17.11.plano-implementa-a-fronteira-db753228*/expect(plano.podeGuardar(101)).toBe(false);
  /*@case 17.11.plano-implementa-a-fronteira-7ca493ba*/expect(plano.podeGuardar(-1)).toBe(false);
  /*@case 17.11.plano-implementa-a-fronteira-58ee376b*/expect(plano.podeGuardar(Number.NaN)).toBe(false);
  /*@case 17.11.plano-implementa-a-fronteira-2c8c966d*/expect(plano.podeGuardar(Number.POSITIVE_INFINITY)).toBe(false);
  /*@case 17.11.plano-implementa-a-fronteira-c87bdc01*/expect(plano.nome).toBe('Básico');
});
