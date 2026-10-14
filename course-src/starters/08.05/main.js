// 08.05 · Bug de off-by-one nos dois laços.
// visitarTodos deve chamar visitar(xs[i]) para TODOS os itens, uma vez cada.
// lerTodos deve chamar ler(xs[j]) para os índices 0..length-1, sem ler fora da lista.
// Antes de corrigir, escreva a previsão para listas de tamanho 0, 1 e 3.

export function visitarTodos(xs, visitar) {
  for (let i = 0; i < xs.length - 1; i++) visitar(xs[i]);
}

export function lerTodos(xs, ler) {
  for (let j = 0; j <= xs.length; j++) ler(xs[j]);
}
