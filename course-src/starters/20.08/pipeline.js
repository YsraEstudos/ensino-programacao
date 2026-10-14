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
