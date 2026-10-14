// 21.04 · Memoize que cresce para sempre.
// Reproduza o crescimento, depois introduza uma política LRU com limite (padrão 2).

function memoize(fn) {
  const cache = new Map();
  const memo = (chave) => {
    if (cache.has(chave)) return cache.get(chave);
    const valor = fn(chave);
    cache.set(chave, valor);
    return valor;
  };
  memo.cache = cache;
  return memo;
}

let calculos = 0;
const quadrado = memoize((n) => { calculos++; return n * n; });

for (let i = 0; i < 1000; i++) quadrado(i);
console.log("entradas no cache:", quadrado.cache.size); // reprodução: cresce sem limite

// Tarefa: memoizeLRU(fn, limite = 2)
// - Acesso move a chave para "mais recente" (no Map: delete + set).
// - Ao passar do limite, remova a mais antiga: cache.keys().next().value.
// - limite 0 não guarda nada; o resultado 0 (quadrado de 0) é um acerto válido.

// Cenário para conferir com limite 2:
// q("A"); q("B"); q("A"); q("C");  -> "B" removida
// q("B")                           -> recalcula
// Ordem de uso das chaves registrada por você: ___
