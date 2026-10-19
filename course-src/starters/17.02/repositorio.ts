// 17.02 · Ajuste somente as assinaturas para preservar relações entre tipos.
// Não implemente Map nem outra persistência.

export interface Entity { id: string }

// Generalize os tipos sem perder a relação entre cada entrada e sua saída.
export function pair(chave: string | number, valor: string | number): (string | number)[] {
  return [chave, valor];
}

export function wrap(valor: unknown): { valor: unknown } {
  return { valor };
}

export interface Repository<T> {
  save(entidade: T): T;
  get(id: string): T | undefined;
}

// Contrato esperado: pair("a", 2) conserva K/V; wrap conserva T;
// Repository<Usuario> devolve Usuario em get, incluindo name, ou undefined.
type Usuario = Entity & { name: string };
