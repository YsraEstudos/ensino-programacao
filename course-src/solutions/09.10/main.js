export function obterOuCalcular(mapa, chave, fabrica) {
  if (typeof mapa.getOrInsertComputed === 'function') return mapa.getOrInsertComputed(chave, fabrica);
  if (!mapa.has(chave)) mapa.set(chave, fabrica());
  return mapa.get(chave);
}

export function criarMemo(calcular) {
  const cache = new Map();
  return chave => obterOuCalcular(cache, chave, () => calcular(chave));
}
