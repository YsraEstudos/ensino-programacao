export function resumirPorCategoria(itens) {
  const totais = new Map();

  for (const item of itens) {
    const categoria = String(item.categoria);
    const totalAtual = totais.get(categoria) ?? 0;
    totais.set(categoria, totalAtual + item.preco);
  }

  return Object.fromEntries(totais);
}
