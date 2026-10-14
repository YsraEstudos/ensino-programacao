// 07.04 · Complete os callbacks.
// pedidos: [{ ativo: boolean, total: number }].
// ativos: só os pedidos ativos. totais: o total de cada pedido ativo, na mesma ordem.
// existeCaro: algum total é ESTRITAMENTE maior que o limite (limite igual não conta).
// Para cada callback, anote o tipo recebido e o tipo devolvido.

export function analisarPedidos(pedidos, limite) {
  const ativos = pedidos.filter(___);
  const totais = ativos.map(___);
  const existeCaro = totais.some(___);
  return { totais, existeCaro };
}
