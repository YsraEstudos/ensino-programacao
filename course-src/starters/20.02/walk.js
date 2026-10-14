// 20.02 · Percurso em pré-ordem com generator.
// Antes de ordenar: em pré-ordem, o nó atual aparece antes ou depois dos filhos? ___
// Monte walk com os blocos e complete o wrapper para aceitar árvore ausente.

/* Blocos (embaralhados)
[A]   for (const child of node.children) {
[B]     yield* walk(child);
[C]   yield node.value;
[D] function* walk(node) {
[E]   }
[F] }
*/

// Cole aqui os blocos na ordem:


// Wrapper: árvore ausente (null ou undefined) não produz valores.
export function* percorrer(arvore) {
  // complete
}

const arvore = {
  value: 1,
  children: [
    { value: 2, children: [{ value: 4, children: [] }] },
    { value: 3, children: [] },
  ],
};

console.log([...percorrer(arvore)]); // esperado: [1, 2, 4, 3]
console.log([...percorrer(null)]);   // esperado: []

// Laziness: pegue só o primeiro valor sem percorrer o resto.
const primeiro = percorrer(arvore).next();
console.log(primeiro); // esperado: { value: 1, done: false }
