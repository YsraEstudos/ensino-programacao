// 21.09 · Laboratório de performance: duas implementações, mesma entrada.
// Este arquivo roda no executor (sem DOM); index.html usa as mesmas funções para montar a tabela.

export function somaComReduce(numeros) {
  return numeros.reduce((total, n) => total + n, 0);
}

export function somaComFor(numeros) {
  let total = 0;
  for (let i = 0; i < numeros.length; i++) total += numeros[i];
  return total;
}

export function medir(fn, entrada, { warmups = 5, runs = 15 } = {}) {
  // implemente: aquecimento, amostras com performance.now(), mediana e dispersão (mínimo e máximo)
}

export function comparar(entrada) {
  if (!Array.isArray(entrada) || entrada.some((n) => !Number.isFinite(n))) {
    return { erro: "Entrada inválida: use uma lista de números finitos." };
  }
  const a = somaComReduce(entrada);
  const b = somaComFor(entrada);
  if (a !== b) return { erro: `Resultados diferentes: ${a} e ${b}` };
  const memoria = globalThis.performance?.memory?.usedJSHeapSize ?? "N/D";
  return {
    resultado: a,
    reduce: medir(somaComReduce, entrada),
    for: medir(somaComFor, entrada),
    memoria,
    ambiente: globalThis.navigator?.userAgent ?? "desconhecido",
  };
}

const entrada = Array.from({ length: 100_000 }, (_, i) => i % 10);
console.log(comparar(entrada));
console.log(comparar([1, Number.NaN]));
// Regra do relatório: sem margem e variância, não declare vencedor.
