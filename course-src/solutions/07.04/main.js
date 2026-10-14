export function analisarPedidos(pedidos, limite) {
  const ativos = pedidos.filter((pedido) => pedido.ativo);
  const totais = ativos.map((pedido) => pedido.total);
  const existeCaro = totais.some((total) => total > limite);
  return { totais, existeCaro };
}
