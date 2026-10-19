// Contrato visível 20.08:
// pipeline(source) oferece map(fn), filter(predicate), take(count) e [Symbol.iterator]().
// source é um iterable. Array cria novo iterator; a mesma instância generator pode estar consumida; para repetir, chame a fábrica e passe a nova instância a outra pipeline.
// Cada operador retorna um pipeline lazy independente; take limita valores aceitos, take(0) não consome, filtros podem descartar pulls, e return() da fonte é propagado ao interromper a iteração.

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
