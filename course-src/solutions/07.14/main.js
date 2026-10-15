export function obterOuInserir(mapa, chave, valorPadrao) {
  if (typeof mapa.getOrInsert === 'function') return mapa.getOrInsert(chave, valorPadrao);
  if (mapa.has(chave)) return mapa.get(chave);
  mapa.set(chave, valorPadrao);
  return valorPadrao;
}

export function contarTipos(itens) {
  const contagem = new Map();
  for (const item of itens) {
    const atual = obterOuInserir(contagem, item.tipo, 0);
    contagem.set(item.tipo, atual + 1);
  }
  return contagem;
}
