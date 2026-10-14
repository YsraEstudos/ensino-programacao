// 10.04 · Método extraído: qual objeto é o `this`?
// `fixo` deveria acompanhar o objeto ORIGINAL (bind), `wrapper` consulta a variável obj na hora da chamada.
// Hoje `fixo` está preso a um objeto separado com valor 4. Reproduza a divergência e corrija o receptor.
// executar(inicial, atualizado, trocado) devolve { antes, depois }:
//   antes  = [fixo(), wrapper()] depois de obj.valor = atualizado
//   depois = [fixo(), wrapper()] depois de obj ser SUBSTITUÍDO por outro objeto com valor `trocado`
// Esperado com (4, 5, 9): antes [5, 5], depois [5, 9].

export function executar(inicial = 4, atualizado = 5, trocado = 9) {
  let obj = { valor: inicial, ler() { return this.valor; } };
  const fixo = obj.ler.bind({ valor: inicial });
  const wrapper = () => obj.ler();
  obj.valor = atualizado;
  const antes = [fixo(), wrapper()];
  obj = { valor: trocado, ler() { return this.valor; } };
  return { antes, depois: [fixo(), wrapper()] };
}
