export function resumirPorCategoria(itens) {
  return itens.reduce((acumulado, item) => {
    acumulado[item.categoria] = (acumulado[item.categoria] ?? 0) + item.preco;
    return acumulado;
  }, {});
}
