// 04.06 · Bug de retorno.
// somaDobros(2, 3) deveria devolver 10, mas devolve NaN e imprime 4 e 6.
// Faça a menor correção: o cálculo devolve valores; imprimir não faz parte do cálculo.

export function dobro(x) {
  console.log(x * 2);
}

export function somaDobros(a, b) {
  return dobro(a) + dobro(b);
}
