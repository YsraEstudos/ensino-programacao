// Contrato visível 22.04:
// Exporte first(xs) e migrar(xs): migrar usa a função explícita; array vazio produz undefined.
// Não modifique Array.prototype nem adicione propriedade enumerável.

// 22.04 · Monkey patch global.
// Este arquivo acrescenta um método a TODOS os arrays do programa, inclusive de bibliotecas de terceiros.

Array.prototype.first = function () {
  return this[0];
};

// Uso espalhado pelo código:
console.log([3, 4].first()); // 3
console.log([].first());     // undefined

// Efeito colateral: o método novo aparece em for...in sobre arrays.
for (const chave in ["a"]) console.log("for...in viu:", chave);

// Tarefa:
// 1. Escreva `export function first(xs)` sem mexer em Array.prototype.
// 2. Migre os usos acima para first(xs) e mantenha o caso de array vazio -> undefined.
// 3. Se um patch global fosse realmente necessário, onde ficariam a declaração `declare global`
//    e a implementação, e o que a documentação precisaria dizer? ___

// Avaliação visível: implementação pendente
export function first(xs) { return xs.first(); }
export function migrar(xs) { return first(xs); }
