export function mostrarTitulo(alvo, titulo) { alvo.replaceChildren(alvo.ownerDocument.createTextNode(String(titulo).replaceAll('<', '&lt;'))); }
