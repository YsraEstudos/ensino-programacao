// Fallback para runtimes sem RegExp.escape (ES2025).
function escapar(texto) {
  if (typeof RegExp.escape === "function") return RegExp.escape(texto);
  return texto.replace(/[\\^$.*+?()[\]{}|\/-]/g, "\\$&");
}

export function contemLiteral(texto, termo) {
  const re = new RegExp(escapar(termo));
  return re.test(texto);
}
