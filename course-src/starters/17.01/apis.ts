// 17.01 · Generic, union ou concreto?
// Antes de olhar as respostas, classifique cada assinatura e diga que informação ela precisa preservar.
// Regra: só use parâmetro de tipo quando ele liga duas posições (entrada e saída, chave e valor...).

type Status = "ativo" | "pausado";
type Usuario = { id: string; nome: string };

// 1. identity(x)              -> devolve o próprio x
// 2. parseStatus(texto)       -> "ativo" | "pausado" ou erro
// 3. first(xs)                -> primeiro item ou undefined
// 4. area(raio)               -> número
// 5. pair(a, b)               -> tupla com os dois valores
// 6. log(mensagem)            -> nada
// 7. getById(usuarios, id)    -> usuário ou undefined
// 8. selectKey(obj, chave)    -> valor da propriedade escolhida

// Escreva a assinatura escolhida para cada uma (corpo pode ser `throw new Error("todo")`):
// export function identity___
// export function parseStatus___
// export function first___
// export function area___
// export function pair___
// export function log___
// export function getById___
// export function selectKey___

// Classificação e justificativa:
// 1. ___  2. ___  3. ___  4. ___  5. ___  6. ___  7. ___  8. ___
export type { Status, Usuario };
