// 17.08 · Cache genérico com expiração e relógio injetável.
// Contrato:
// - set(chave, valor, ttlMs): ttl negativo lança RangeError; expiresAt = agora + ttl.
// - Uma entrada expira quando agora >= expiresAt: get devolve undefined e a remove; has devolve false.
// - Valores 0 e undefined são armazenáveis: não use truthiness; has distingue presença de ausência.

export type Relogio = () => number;
type Entrada<V> = { valor: V; expiresAt: number };

export class Cache<K, V> {
  #entradas = new Map<K, Entrada<V>>();
  #agora: Relogio;

  constructor(agora: Relogio = () => Date.now()) {
    this.#agora = agora;
  }

  set(chave: K, valor: V, ttlMs: number): void {
    // implemente
  }

  get(chave: K): V | undefined {
    // implemente
  }

  has(chave: K): boolean {
    // implemente
  }

  delete(chave: K): boolean {
    return this.#entradas.delete(chave);
  }
}
