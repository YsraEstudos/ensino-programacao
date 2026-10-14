// 19.07 · Orçamento de complexidade: duas recursões, dois propósitos.
// Leia as duas, descreva um valor finito aceito por JsonValue e recomende: simplificar, manter ou deferir DeepDto.

// A — recursão que modela dados
export type JsonValue =
  | null
  | boolean
  | number
  | string
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

// B — recursão que transforma tipos, usada para um DTO de duas propriedades
type Primitivo = string | number | boolean | null | undefined;
export type DeepDto<T> = T extends Primitivo
  ? T
  : T extends Date
    ? string
    : T extends readonly (infer U)[]
      ? readonly DeepDto<U>[]
      : T extends (...args: never[]) => unknown
        ? never
        : T extends Map<infer K, infer V>
          ? Array<[DeepDto<K>, DeepDto<V>]>
          : T extends Set<infer U>
            ? DeepDto<U>[]
            : T extends object
              ? { -readonly [K in keyof T as T[K] extends (...args: never[]) => unknown ? never : K]-?: DeepDto<T[K]> }
              : never;

type Pedido = { id: string; criadoEm: Date };
export type PedidoDto = DeepDto<Pedido>;

// Alternativa menor para o caso real: ___
// Valor finito aceito por JsonValue: ___
// Nenhum dos dois valida JSON em runtime: onde a validação acontece? ___
