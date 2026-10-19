// Contrato visível 20.08:
// pipeline(source) oferece map(fn), filter(predicate), take(count) e [Symbol.iterator]().
// Cada operador retorna um novo pipeline lazy; take limita valores aceitos, take(0) não consome e return() da fonte é respeitado ao interromper a iteração.
// Exporte pipeline(source), cujo builder oferece map(fn), filter(predicate), take(count) e [Symbol.iterator]().
// Cada encadeamento é lazy e imutável; take(2) limita dois valores aceitos e sair do for...of chama return() na fonte.

// pipeline(source).map(f).filter(p).take(n): cada etapa é um generator; nada roda até alguém pedir valores.
// Os métodos abaixo ainda devolvem a fonte sem transformar: os testes mostram FALHOU até você implementá-los.

export function pipeline(iteravel) {
  return {
    map(fn) {
      // devolva pipeline(...) de um generator que aplica fn a cada valor
      return pipeline(iteravel);
    },
    filter(predicado) {
      // devolva pipeline(...) de um generator que só repassa valores aprovados
      return pipeline(iteravel);
    },
    take(n) {
      // devolva pipeline(...) de um generator que para depois de n valores
      // (take(0) não deve pedir nenhum valor à fonte)
      return pipeline(iteravel);
    },
    [Symbol.iterator]() {
      return iteravel[Symbol.iterator]();
    },
  };
}
