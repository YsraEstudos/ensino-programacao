// 21.03 · Benchmark com aquecimento, várias amostras e mediana.

export function mediana(amostras) {
  const ordenadas = amostras.toSorted((a, b) => a - b);
  const meio = Math.floor(ordenadas.length / 2);
  // complete: quantidade par -> média dos dois centrais
  return ___;
}

export function benchmark(fn, { warmups = 5, runs = 9 } = {}) {
  for (let i = 0; i < warmups; i++) fn(); // aquecimento: não entra nas amostras
  const amostras = [];
  for (let i = 0; i < runs; i++) {
    const inicio = performance.now();
    ___; // execute a função medida
    amostras.push(___);
  }
  return { amostras, mediana: mediana(amostras) };
}

console.log(mediana([1, 9, 2]));    // esperado: 2
console.log(mediana([1, 9, 2, 4])); // esperado: 3

const resultado = benchmark(() => {
  let total = 0;
  for (let i = 0; i < 1e5; i++) total += Math.sqrt(i);
  return total;
});
console.log(resultado.mediana.toFixed(3), "ms de mediana em", resultado.amostras.length, "amostras");
// Se fn lançar um erro, o que benchmark deve fazer? ___
