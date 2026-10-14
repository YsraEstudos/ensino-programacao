export function criarConta(inicial) {
  let saldo = inicial;
  return {
    depositar(valor) {
      if (!(valor > 0)) return false;
      saldo += valor;
      return true;
    },
    consultar() {
      return saldo;
    },
  };
}

console.log(criarConta(2).depositar(3));
