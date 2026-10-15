export class Conta {
  #saldo = 0;

  depositar(valor) {
    this.#saldo += valor;
    return this;
  }

  get saldo() {
    return this.#saldo;
  }

  static ehConta(valor) {
    return typeof valor === 'object' && valor !== null && #saldo in valor;
  }
}
