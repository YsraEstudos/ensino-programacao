export function resumirPorCategoria(itens) {
  const acumulado = itens.reduce((resultado, item) => {
    resultado[item.categoria] = (resultado[item.categoria] ?? 0) + item.preco;
    return resultado;
  }, Object.create(null));
  return { ...acumulado };
}

console.log(JSON.stringify(resumirPorCategoria([
  {categoria: "A", preco: 2},
  {categoria: "A", preco: 3},
  {categoria: "B", preco: 4},
])));
