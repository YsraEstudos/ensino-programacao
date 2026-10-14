export interface Capacidade {
  readonly nome: string;
  podeGuardar(bytes: number): boolean;
}

export class Plano {
  limiteBytes: number;
  nome: string;

  constructor(nome: string, limiteBytes: number) {
    this.nome = nome;
    this.limiteBytes = limiteBytes;
  }

  podeGuardar(bytes: number): boolean {
    // Implemente a regra sem acessar estado global.
    return false;
  }
}
