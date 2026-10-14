// 10.05 · Bug de herança.
// 1. new Filha(2, "A") lança ReferenceError: `this` é usado antes de super(x). Corrija a ordem.
// 2. Depois, descricao() ainda omite o texto da base: componha com super.descricao().
// Esperado: new Filha(2, "A").descricao() -> "x=2; A". `nome` é uma string recebida pelo constructor.

export class Base {
  constructor(x) {
    this.x = x;
  }
  descricao() {
    return `x=${this.x}`;
  }
}

export class Filha extends Base {
  constructor(x, nome) {
    this.nome = nome;
    super(x);
  }
  descricao() {
    return this.nome;
  }
}
