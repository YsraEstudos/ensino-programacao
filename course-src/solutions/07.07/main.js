export function frequencias(palavras) {
  const contagem = new Map();
  for (const palavra of palavras) {
    contagem.set(palavra, (contagem.get(palavra) ?? 0) + 1);
  }
  return contagem;
}

export function porCategoria(registros) {
  const grupos = new Map();
  for (const { categoria, id } of registros) {
    if (!grupos.has(categoria)) grupos.set(categoria, []);
    grupos.get(categoria).push(id);
  }
  return grupos;
}
