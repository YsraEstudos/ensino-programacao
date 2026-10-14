export function somar(no) {
  if (no === null || no === undefined) return 0;
  const esquerda = somar(no.esq ?? null);
  const direita = somar(no.dir ?? null);
  return no.valor + esquerda + direita;
}

console.log(somar({valor: 2, esq: {valor: 3}, dir: {valor: 5}}));
