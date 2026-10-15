export function estaBemFormado(texto) {
  return texto.isWellFormed();
}

export function prepararParaEnvio(texto) {
  return { ok: estaBemFormado(texto), texto: texto.toWellFormed() };
}
