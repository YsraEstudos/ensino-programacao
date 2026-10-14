import type { Estado } from "./dominio.ts";

// Porta: o que o serviço precisa do armazenamento, sem saber onde os dados ficam.
export interface Repositorio {
  carregar(): Promise<Estado>;
  salvar(estado: Estado): Promise<void>;
}

export class StorageError extends Error {
  constructor(mensagemPublica: string, options?: { cause?: unknown }) {
    super(mensagemPublica, options);
  }
}
