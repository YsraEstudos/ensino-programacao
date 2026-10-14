// 08.03 · Busca binária em lista ORDENADA crescente.
// Devolve o índice de alvo ou -1. Com duplicatas, qualquer índice que contenha o alvo é aceito.
// Complete os dois ___ e explique qual caso de borda cada um protege ([], primeiro, último, ausente).

export function busca(xs, alvo) {
  let lo = 0, hi = xs.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (xs[mid] === alvo) return mid;
    if (xs[mid] < alvo) lo = ___;
    else hi = ___;
  }
  return -1;
}
