// Rascunho independente de assinaturas para comparar com repositorio.ts.
export type Entity = { id: string };
export function pair(chave: string | number, valor: string | number): (string | number)[] { return [chave, valor]; }
export function wrap(valor: unknown): { valor: unknown } { return { valor }; }
export interface Repository<T> { save(entidade: T): T; get(id: string): T | undefined; }
