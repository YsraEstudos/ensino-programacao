// 15.07 · Formulário de catálogo sob flags estritas extras (veja tsconfig.json).
// Rode `npx tsc -p .`, corrija sem `!` nem cast e decida o contrato de ausência do produto.

export type Produto = { nome: string; apelido?: string };

export function primeiroNome(lista: string[]): string {
  return lista[0].toUpperCase();
}

export function semApelido(produto: Produto): Produto {
  return { ...produto, apelido: undefined };
}

export function rotulo(produto: Produto): string {
  // Compila, mas `!` só esconde a ausência: troque por uma decisão explícita.
  return produto.apelido!.trim();
}

// Casos próprios para o contrato de ausência:
// primeiroNome([])                                -> ___
// semApelido({ nome: "Caneca", apelido: "C" })    -> ___
// rotulo({ nome: "Caneca" })                      -> ___
