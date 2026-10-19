import { z } from 'zod';

export const PagamentoSchema = z.object({
  id: z.string().min(1, 'texto não vazio'),
  amount: z.number().finite('número finito'),
});
export type Pagamento = z.infer<typeof PagamentoSchema>;

export function validarComSchema(payload: unknown) {
  const result = PagamentoSchema.safeParse(payload);
  if (!result.success) return { ok: false as const, erros: result.error.issues.map(issue => issue.path.length ? issue.path.join('.') + ': ' + issue.message : issue.message) };
  return { ok: true as const, valor: result.data };
}

export const casosSchema = [{ id: 'p1', amount: 10 }, { id: 'p1', amount: '10' }, { id: 'p1', amount: Infinity }, { id: 'p1', amount: NaN }, { id: 'p1', amount: null }, null, { id: '', amount: 1 }];
for (const caso of casosSchema) console.log(JSON.stringify(caso), '->', JSON.stringify(validarComSchema(caso)));
