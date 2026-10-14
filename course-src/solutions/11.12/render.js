export function mostrarTitulo(alvo, titulo) {
  const texto = String(titulo);
  alvo.replaceChildren();
  if (texto.length === 0) {
    alvo.appendChild(alvo.ownerDocument.createComment(''));
    return;
  }
  alvo.appendChild(alvo.ownerDocument.createTextNode(texto));
}
