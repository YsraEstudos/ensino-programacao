// 18.08 · Formulário de filtros tipado a partir da configuração.
// O tipo derivado diz o que cada campo deve ser; a leitura do formulário continua recebendo texto.

type Field = { kind: "text" } | { kind: "number"; min?: number };

export const config = {
  nome: { kind: "text" },
  idade: { kind: "number", min: 0 },
} as const satisfies Record<string, Field>;

export type FieldName = keyof typeof config;

// Complete: number para campos "number", string para campos "text".
export type Valores = { [K in FieldName]: ___ };

// Implemente: recebe os valores submetidos (sempre texto) e devolve Valores,
// convertendo e validando cada campo. Valor inválido lança RangeError com o nome do campo.
export function lerFormulario(enviado: Record<string, string>): Valores {
  // implemente
}

// Casos para conferir:
// lerFormulario({ nome: " Ana ", idade: "30" }) -> { nome: "Ana", idade: 30 }
// lerFormulario({ nome: "Ana", idade: "-1" })   -> RangeError (idade)
// lerFormulario({ nome: "Ana" })                -> ___ (decida e documente)
