export function agrupar(pedidos) {
  if (typeof Map.groupBy === "function") return Map.groupBy(pedidos, (pedido) => pedido.status);
  const grupos = new Map();
  for (const pedido of pedidos) {
    if (!grupos.has(pedido.status)) grupos.set(pedido.status, []);
    grupos.get(pedido.status).push(pedido);
  }
  return grupos;
}
