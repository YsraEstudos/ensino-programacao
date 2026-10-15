// Média aritmética simples. Lista vazia devolve 0.
export function calcularMedia(notas) {
  if (notas.length === 0) return 0;
  return notas.reduce((soma, nota) => soma + nota, 0) / notas.length;
}
