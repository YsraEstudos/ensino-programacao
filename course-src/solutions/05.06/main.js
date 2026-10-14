// Versão compatível: copia explícita antes de ordenar e reverter.
export function ordenarSemMutar(numeros) {
  return [...numeros].sort((a, b) => a - b).reverse();
}

// Versão moderna (ES2023): métodos que devolvem uma cópia.
export function ordenarSemMutarModerno(numeros) {
  return numeros.toSorted((a, b) => a - b).toReversed();
}
