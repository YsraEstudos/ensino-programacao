// 19.04 · Por que IsString<string | number> virou uma união?

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

export type IsString<T> = T extends string ? true : false;

// Este type test falha hoje. Leia o diagnóstico antes de mexer:
export type Bug = Expect<Equal<IsString<string | number>, false>>;

// Crie WholeString<T> com o parâmetro "vestido" numa tupla: [T] extends [string] ? true : false
// export type WholeString<T> = ___;

// Type tests para as duas versões (complete as previsões):
// IsString<string>         -> ___     WholeString<string>         -> ___
// IsString<string | number> -> ___    WholeString<string | number> -> ___
// IsString<never>          -> ___     WholeString<never>          -> ___

// Que pergunta cada versão responde? Qual o requisito do produto pede? ___
