// 16.06 · Nível de acesso derivado da lista do produto.
// Hoje a lista runtime e a union de tipos repetem os mesmos textos: uma mudança atualiza um e esquece o outro.

export const NIVEIS = ["leitor", "editor", "admin"];
export type Nivel = "leitor" | "editor" | "admin";

// Tarefa: derive Nivel de NIVEIS com `as const` e `(typeof NIVEIS)[number]`.

// Depois de derivar, registre o que o typecheck faz com cada linha:
// const ok: Nivel = "editor";      // ___
// const fora: Nivel = "dono";      // ___
// NIVEIS.push("dono");             // ___
// Em runtime, o array ficou congelado? Teste com Object.isFrozen(NIVEIS): ___
