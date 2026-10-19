// Copie este arquivo para uma pasta temporária após instalar zod@3.25.76 e typescript@6.0.3.
import { z } from 'zod';

const Pagamento = z.object({
  id: z.string().min(1, 'texto não vazio'),
  // TODO: aceite somente amount numérico finito; não use z.coerce.number().
});
type Pagamento = z.infer<typeof Pagamento>;

function validarComSchema(payload: unknown) {
  return Pagamento.safeParse(payload);
}

const casos = [{ id: 'p1', amount: 10 }, { id: 'p1', amount: '10' }, { id: 'p1', amount: Infinity }, { id: 'p1', amount: NaN }, { id: 'p1', amount: null }, null, { id: '', amount: 1 }];
for (const caso of casos) console.log(JSON.stringify(caso), '->', JSON.stringify(validarComSchema(caso)));
