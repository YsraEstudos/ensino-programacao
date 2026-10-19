export function resumirPorCategoria(itens) {
  const acumulado = itens.reduce((resultado, item) => {
    resultado[item.categoria] = (resultado[item.categoria] ?? 0) + item.preco;
    return resultado;
  }, Object.create(null));
  return { ...acumulado };
}
