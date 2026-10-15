// Troque as duas funções por implementações reais.
// obterOuCalcular(mapa, chave, fabrica): use mapa.getOrInsertComputed(chave, fabrica) quando existir;
// senão, use has, set e get. A fábrica só roda quando a chave falta.
// criarMemo(calcular): devolva uma função que guarda os resultados por chave com obterOuCalcular.
export function obterOuCalcular(mapa, chave, fabrica) {
  return fabrica();
}

export function criarMemo(calcular) {
  return chave => calcular(chave);
}
