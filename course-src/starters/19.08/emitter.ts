// 19.08 · Emitter de eventos de catálogo com payload ligado ao nome.
// A API pública preserva Events[K]. Se precisar de cast interno, limite-o ao menor trecho possível.

export type Events = {
  itemAdded: { sku: string };
  priceChanged: { sku: string; price: number };
  itemRemoved: { sku: string };
};

export type Listener<P> = (payload: P) => void;

export class Emitter<E extends Record<string, unknown>> {
  // Escolha a estrutura: por exemplo { [K in keyof E]?: Set<Listener<E[K]>> }

  on<K extends keyof E>(evento: K, listener: Listener<E[K]>): void {
    // implemente
  }

  off<K extends keyof E>(evento: K, listener: Listener<E[K]>): void {
    // implemente
  }

  emit<K extends keyof E>(evento: K, payload: E[K]): void {
    // implemente
  }
}

// Devem ser rejeitadas pelo typecheck (deixe com @ts-expect-error no teste):
// new Emitter<Events>().emit("itemAdded", { sku: 1 });
// new Emitter<Events>().on("priceChanged", (p: { sku: string; price: string }) => {});
