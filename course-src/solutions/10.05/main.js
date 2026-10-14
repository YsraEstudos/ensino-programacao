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
    super(x);
    this.nome = nome;
  }
  descricao() {
    return `${super.descricao()}; ${this.nome}`;
  }
}
