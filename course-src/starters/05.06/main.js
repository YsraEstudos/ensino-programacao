// 05.06 · Bug da mutação: ordem decrescente SEM alterar a entrada.
// 1. Corrija ordenarSemMutar com cópia explícita (compatível com runtimes antigos).
// 2. Escreva ordenarSemMutarModerno com os métodos que devolvem cópia (toSorted e toReversed).
// 3. Teste as duas com Object.freeze([2, 1]) (entrada congelada) e [] e compare clareza e compatibilidade.

export function ordenarSemMutar(numeros) {
  return numeros.sort((a, b) => a - b).reverse();
}

export function ordenarSemMutarModerno(numeros) {
  return numeros; // troque pela versão com toSorted e toReversed
}
