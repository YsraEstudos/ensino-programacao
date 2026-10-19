export type Coluna = "a-fazer" | "fazendo" | "feito";
export type Tarefa = { readonly id: string; titulo: string; coluna: Coluna };
export type Estado = { versao: 1; tarefas: readonly Tarefa[] };
export class ValidationError extends Error {}
export const estadoInicial: Estado = { versao: 1, tarefas: [] };
export function criar(estado: Estado, id: string, titulo: string): Estado {
  const limpo = titulo.trim();
  if (!limpo) throw new ValidationError("título obrigatório");
  if (!id.trim() || estado.tarefas.some(tarefa => tarefa.id === id)) throw new ValidationError("id inválido ou duplicado");
  return { ...estado, tarefas: [...estado.tarefas, { id, titulo: limpo, coluna: "a-fazer" }] };
}
export function mover(estado: Estado, id: string, coluna: Coluna): Estado {
  if (!["a-fazer", "fazendo", "feito"].includes(coluna)) throw new ValidationError("coluna inválida");
  let encontrado = false;
  const tarefas = estado.tarefas.map(tarefa => {
    if (tarefa.id !== id) return tarefa;
    encontrado = true;
    return { ...tarefa, coluna };
  });
  if (!encontrado) throw new ValidationError("tarefa inexistente");
  return { ...estado, tarefas };
}
export function remover(estado: Estado, id: string): Estado {
  if (!estado.tarefas.some(tarefa => tarefa.id === id)) throw new ValidationError("tarefa inexistente");
  return { ...estado, tarefas: estado.tarefas.filter(tarefa => tarefa.id !== id) };
}
