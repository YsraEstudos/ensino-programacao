// 20.03 · Range iterável: a coleção guarda start/end; cada iteração tem o próprio cursor.

export class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  [Symbol.iterator]() {
    let atual = ___;          // o cursor vive aqui, não no Range
    const end = this.end;
    return {
      next() {
        if (___) return { value: undefined, done: true };
        return { value: atual++, done: ___ };
      },
    };
  }
}

console.log([...new Range(2, 4)]); // esperado: [2, 3, 4]
console.log([...new Range(5, 4)]); // esperado: []

// Escreva o teste que distingue estado da coleção do estado do cursor:
const r = new Range(1, 3);
const primeira = [...r];
const segunda = [...r];
console.log(primeira, segunda); // as duas devem começar do 1. Por quê? ___
