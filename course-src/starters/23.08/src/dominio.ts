export type Coluna = "a-fazer" | "fazendo" | "feito";
export type Tarefa = { readonly id: string; titulo: string; coluna: Coluna };
export type Estado = { versao: 1; tarefas: readonly Tarefa[] };

export class ValidationError extends Error {}

export const estadoInicial: Estado = { versao: 1, tarefas: [] };

export function criar(estado: Estado, id: string, titulo: string): Estado {
  const limpo = titulo.trim();
  if (limpo === "") throw new ValidationError("título obrigatório");
  return { ...estado, tarefas: [...estado.tarefas, { id, titulo: limpo, coluna: "a-fazer" }] };
}

export function mover(estado: Estado, id: string, coluna: Coluna): Estado {
  // implemente: id inexistente -> ValidationError; não mute `estado`
}

export function remover(estado: Estado, id: string): Estado {
  // implemente
}
