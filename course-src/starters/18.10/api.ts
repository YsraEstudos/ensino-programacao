// 18.10 · Utility types com propósito.
// Os aliases abaixo foram copiados à mão. Refatore usando Awaited, ReturnType, NonNullable,
// Parameters, Exclude e Extract só onde a transformação preserva uma relação com a fonte.
// Explique cada alias em uma frase.

type User = { id: string; nome: string };
type Result = { ok: true; valor: number } | { ok: false; erro: string };
export type Evento = "ok" | "error" | "retry";

export async function loadUser(id: string): Promise<User | null> {
  return id === "u1" ? { id, nome: "Ana" } : null;
}

export function handle(input: string): Result {
  const n = Number(input);
  return Number.isFinite(n) ? { ok: true, valor: n } : { ok: false, erro: `não é número: ${input}` };
}

// Cópias manuais
export type LoadedUser = User | null;          // Awaited<ReturnType<typeof loadUser>> ?
export type PresentUser = User;                // ___
export type HandleInput = string;              // ___
export type SemErro = "ok" | "retry";          // ___
export type SoErro = "error";                  // ___

// Lembrete: nenhum desses tipos valida o que chega em runtime. Onde a validação precisa acontecer? ___
