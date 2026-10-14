export function visitarTodos(xs, visitar) {
  for (let i = 0; i < xs.length; i++) visitar(xs[i]);
}

export function lerTodos(xs, ler) {
  for (let j = 0; j < xs.length; j++) ler(xs[j]);
}
