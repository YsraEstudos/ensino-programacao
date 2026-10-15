// Troque a classe por uma implementação real.
// Conta guarda o saldo no campo privado #saldo, com depositar(valor) e o getter saldo.
// ehConta(valor): use a forma `#saldo in valor` para reconhecer a marca do campo privado.
// Não use instanceof: ele aceita objetos criados só com Object.create(Conta.prototype).
export class Conta {
  #saldo = 0;

  depositar(valor) {
    return this;
  }

  get saldo() {
    return this.#saldo;
  }

  static ehConta(valor) {
    return valor instanceof Conta;
  }
}
