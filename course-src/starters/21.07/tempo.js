// Contrato visível 21.07:
// Implemente debounce(fn, ms, relogio) e throttle(fn, ms, relogio).
// relogio fornece agora(), setTimeout(fn, ms) e clearTimeout(id). Simule 100 eventos em t=0,10,...,990 ms.
// Debounce final chama uma vez em t=1090; throttle inicial chama em t=0,100,...,900.

// 21.07 · Debounce e throttle com relógio falso (determinístico).
// O relógio falso substitui setTimeout/Date.now para medir número e instante das chamadas.

function criarRelogio() {
  let agora = 0;
  let tarefas = [];
  return {
    agora: () => agora,
    setTimeout(fn, ms) { const t = { quando: agora + ms, fn }; tarefas.push(t); return t; },
    clearTimeout(t) { tarefas = tarefas.filter((x) => x !== t); },
    avancarAte(alvo) {
      for (;;) {
        const proxima = tarefas.filter((t) => t.quando <= alvo).sort((x, y) => x.quando - y.quando)[0];
        if (!proxima) break;
        tarefas = tarefas.filter((t) => t !== proxima);
        agora = proxima.quando;
        proxima.fn();
      }
      agora = alvo;
    },
  };
}

// Trailing: chama fn `ms` depois do último evento.
function debounce(fn, ms, relogio) {
  // implemente com relogio.setTimeout / relogio.clearTimeout
  return () => {};
}

// Leading: chama no primeiro evento e ignora os seguintes até passarem `ms`.
function throttle(fn, ms, relogio) {
  // implemente com relogio.agora()
  return () => {};
}

function simular(criar) {
  const relogio = criarRelogio();
  const chamadas = [];
  const alvo = criar(() => chamadas.push(relogio.agora()), 100, relogio);
  for (const t of [0, 20, 40, 160]) {
    relogio.avancarAte(t);
    alvo();
  }
  relogio.avancarAte(1000);
  return chamadas;
}

console.log("debounce", simular(debounce)); // esperado: [140, 260]
console.log("throttle", simular(throttle)); // esperado: [0, 160]
// Política de borda: um evento exatamente em t=100 dispara no throttle? ___
