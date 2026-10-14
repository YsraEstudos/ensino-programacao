export function executar(inicial = 4, atualizado = 5, trocado = 9) {
  let obj = { valor: inicial, ler() { return this.valor; } };
  const fixo = obj.ler.bind(obj);
  const wrapper = () => obj.ler();
  obj.valor = atualizado;
  const antes = [fixo(), wrapper()];
  obj = { valor: trocado, ler() { return this.valor; } };
  return { antes, depois: [fixo(), wrapper()] };
}
