// Troque as duas funções por implementações reais.
// estaBemFormado(texto): use texto.isWellFormed().
// prepararParaEnvio(texto): devolva { ok, texto }. ok diz se a entrada já era bem formada;
// texto substitui surrogates isolados por U+FFFD com toWellFormed().
export function estaBemFormado(texto) {
  return true;
}

export function prepararParaEnvio(texto) {
  return { ok: true, texto };
}
