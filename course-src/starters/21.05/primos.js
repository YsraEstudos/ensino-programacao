// 21.05 · Cálculo puro que bloqueia a interface quando n é grande.
// Este arquivo roda no executor do site; worker.js e main.js rodam no navegador, servidos localmente.

export function contarPrimos(n) {
  let total = 0;
  for (let i = 2; i <= n; i++) {
    let primo = true;
    for (let d = 2; d * d <= i; d++) {
      if (i % d === 0) { primo = false; break; }
    }
    if (primo) total++;
  }
  return total;
}

// Teste da função pura (deve dar o mesmo resultado dentro do worker):
console.log(contarPrimos(10));   // esperado: 4
console.log(contarPrimos(100));  // esperado: 25
