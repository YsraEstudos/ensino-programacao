export function linhas(pedidos) {
  return pedidos.flatMap((pedido) =>
    pedido.status === "ativo" ? pedido.itens.map((item) => ({ pedido: pedido.id, item })) : []
  );
}
