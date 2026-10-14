export function metricas(numeros) {
  for (const n of numeros) {
    if (!Number.isFinite(n)) throw new TypeError(`valor não finito: ${String(n)}`);
  }
  if (numeros.length === 0) return [null, null, 0, null];
  let min = numeros[0];
  let max = numeros[0];
  let soma = 0;
  for (const n of numeros) {
    if (n < min) min = n;
    if (n > max) max = n;
    soma += n;
  }
  return [min, max, soma, soma / numeros.length];
}
