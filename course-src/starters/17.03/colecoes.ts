// 17.03 · Callbacks tipados sem Function nem any.
// Complete as assinaturas. A entrada é readonly: a função promete não alterar o array recebido.

export function map<T, U>(xs: readonly T[], fn: (x: T, index: number) => ___): ___ {
  const saida: U[] = [];
  for (let i = 0; i < xs.length; i++) saida.push(fn(xs[i] as T, i));
  return saida;
}

export function filter<T>(xs: readonly T[], predicate: (x: ___, index: number) => boolean): ___ {
  const saida: T[] = [];
  xs.forEach((x, i) => { if (predicate(x, i)) saida.push(x); });
  return saida;
}

// Confira o tipo inferido de cada resultado no editor:
// const textos = map([1, 2], (n) => String(n));        // esperado: string[]
// const positivos = filter([0, 1], (n) => n > 0);      // esperado: number[]
// Por que map precisa de dois parâmetros de tipo e filter de um? ___
