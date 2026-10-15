export function criarConta(id, saldoInicial) {
  let saldo = 0;
  const conta = {
    get saldo() {
      return saldo;
    },
    set saldo(valor) {
      if (valor < 0) throw new RangeError('saldo não pode ser negativo');
      saldo = valor;
    },
  };
  Object.defineProperty(conta, 'id', { value: id, enumerable: false, writable: false });
  conta.saldo = saldoInicial;
  return conta;
}
