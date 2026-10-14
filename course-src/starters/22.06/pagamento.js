// 22.06 · Mesma fronteira, duas abordagens. Primeiro o guard manual (executável aqui).

export function validarPagamento(payload) {
  if (typeof payload !== "object" || payload === null) {
    return { ok: false, erros: ["payload precisa ser objeto"] };
  }
  const erros = [];
  if (typeof payload.id !== "string" || payload.id === "") erros.push("id: texto não vazio");
  // TODO: valide amount como número finito; NaN, null e strings precisam ser rejeitados.
  return erros.length ? { ok: false, erros } : { ok: true, valor: { id: payload.id, amount: payload.amount } };
}

const casos = [{ id: "p1", amount: 10 }, { id: "p1", amount: "10" }, { id: "p1", amount: Number.NaN }, { id: "p1", amount: null }, null];
for (const caso of casos) {
  const descricao = caso === null ? "null" : `{ id: ${JSON.stringify(caso.id)}, amount: ${typeof caso.amount === "string" ? JSON.stringify(caso.amount) : String(caso.amount)} }`;
  console.log(descricao, "->", JSON.stringify(validarPagamento(caso)));
}

// Segunda versão, no seu computador, depois de decidir a dependência (npm install zod ou valibot):
// import * as z from "zod";
// const Pagamento = z.object({ id: z.string().min(1), amount: z.number().finite() });
// type Pagamento = z.infer<typeof Pagamento>;
// Pagamento.safeParse(caso)
//
// Compare: mensagens de erro, tipo inferido, tamanho adicionado ao bundle e custo de manter a dependência.
