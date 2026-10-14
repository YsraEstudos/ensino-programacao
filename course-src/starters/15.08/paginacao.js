// 15.08 · Utilitários de paginação (versão JavaScript da etapa 13).
// Migre para paginacao.ts com TypeScript strict, uma função por vez, mantendo exports e erros.

export function clamp(valor, minimo, maximo) {
  if (minimo > maximo) throw new RangeError("minimo maior que maximo");
  return Math.min(Math.max(valor, minimo), maximo);
}

export function unique(valores) {
  return [...new Set(valores)];
}

export function paginar(valores, pagina, tamanho) {
  if (!Number.isInteger(pagina) || pagina < 1) throw new RangeError("pagina deve ser inteiro >= 1");
  if (!Number.isInteger(tamanho) || tamanho < 1) throw new RangeError("tamanho deve ser inteiro >= 1");
  const inicio = (pagina - 1) * tamanho;
  return valores.slice(inicio, inicio + tamanho);
}
