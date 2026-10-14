// Objeto sem protótipo: "__proto__" vira uma chave própria comum, sem setter herdado.
export function indexar(entidades) {
  const indice = Object.create(null);
  for (const entidade of entidades) {
    indice[entidade.id] = entidade;
  }
  return indice;
}
