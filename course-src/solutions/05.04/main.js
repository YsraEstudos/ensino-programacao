export function posicoes(lista, termo) {
  return { primeira: lista.indexOf(termo), ultima: lista.lastIndexOf(termo) };
}
