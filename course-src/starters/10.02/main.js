export class Cofre {
  #saldo;

  constructor(inicial) {
    this.#saldo = inicial;
  }

  depositar(valor) {
    if (!(valor > 0)) return false;
    this.#saldo += valor;
    return true;
  }

  get saldo() {
    return this.#saldo;
  }
}

console.log(new Cofre(2).saldo);
