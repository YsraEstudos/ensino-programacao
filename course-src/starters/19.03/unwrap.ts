// 19.03 · Complete os tipos com `infer`.

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

export type Unwrap<T> = T extends Promise<infer ___> ? ___ : T;
// `any[]` aqui só descreve "qualquer lista de parâmetros"; o resultado não vira any.
export type FnResult<T> = T extends (...args: any[]) => infer ___ ? ___ : never;

async function buscarData(): Promise<Date> {
  return new Date();
}

// Type tests positivos (complete as previsões):
export type T1 = Expect<Equal<Unwrap<Promise<number>>, number>>;
export type T2 = Expect<Equal<Unwrap<number>, ___>>;
export type T3 = Expect<Equal<FnResult<() => string>, ___>>;
export type T4 = Expect<Equal<FnResult<typeof buscarData>, ___>>;          // antes de Awaited
export type T5 = Expect<Equal<Awaited<FnResult<typeof buscarData>>, ___>>; // depois de Awaited

// Type test negativo: escreva um que deve falhar e deixe-o com @ts-expect-error.
// // @ts-expect-error ___
// export type T6 = Expect<Equal<FnResult<() => string>, number>>;
