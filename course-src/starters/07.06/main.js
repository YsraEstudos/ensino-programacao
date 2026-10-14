export function resumirPorCategoria(itens) {
  const resumo = itens.reduce((acumulado, item) => {
    acumulado[item.categoria] = item.preco;
    return acumulado;
  }, {});
  return resumo;
}

console.log(JSON.stringify(resumirPorCategoria([
  {categoria: "A", preco: 2},
  {categoria: "A", preco: 3},
  {categoria: "B", preco: 4},
])));
