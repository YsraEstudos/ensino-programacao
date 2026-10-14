export function compararPermissoes(a, b) {
  const intersecao = new Set();
  const diferenca = new Set();
  for (const item of a) {
    if (b.has(item)) intersecao.add(item);
    else diferenca.add(item);
  }
  let subconjunto = true;
  for (const item of b) {
    if (!a.has(item)) {
      subconjunto = false;
      break;
    }
  }
  return { intersecao, diferenca, subconjunto };
}
