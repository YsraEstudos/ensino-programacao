export interface Capacidade {
  readonly nome: string;
  podeGuardar(bytes: number): boolean;
}

export class Plano implements Capacidade {
  private readonly limiteBytes: number;
  readonly nome: string;

  constructor(nome: string, limiteBytes: number) {
    this.nome = nome;
    this.limiteBytes = limiteBytes;
  }

  podeGuardar(bytes: number): boolean {
    return Number.isFinite(bytes) && bytes >= 0 && bytes <= this.limiteBytes;
  }
}
