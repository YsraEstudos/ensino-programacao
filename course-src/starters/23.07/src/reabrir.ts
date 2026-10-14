// Esqueleto do serviço de reabertura, para encaixar no seu capstone (23.08).
import type { Estado } from "./dominio.ts";

export type Usuario = { id: string; papel: "comum" | "admin" };
export type EventoAuditoria = { tipo: "reaberta"; tarefaId: string; por: string; em: string };

export class ForbiddenError extends Error {}

export interface RepositorioComAuditoria {
  carregar(): Promise<Estado>;
  // Salva estado e evento juntos: ou os dois persistem, ou nenhum.
  salvarComEvento(estado: Estado, evento: EventoAuditoria): Promise<void>;
}

export async function reabrir(
  repositorio: RepositorioComAuditoria,
  usuario: Usuario,
  tarefaId: string,
  agora: () => Date = () => new Date(),
): Promise<Estado> {
  // implemente: usuário comum -> ForbiddenError antes de qualquer escrita;
  // tarefa inexistente ou fora de "feito" -> erro de validação;
  // admin -> estado com a tarefa em "a-fazer" + evento de auditoria salvos juntos.
}
