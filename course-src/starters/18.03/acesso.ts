// 18.03 · Chave e valor relacionados pelo tipo.
// Complete a assinatura para que o retorno acompanhe a chave escolhida.

export function get<T, K extends ___>(obj: T, key: K): ___ {
  return obj[key];
}

// Esperado depois de completar:
// get({ n: 2, s: "a" }, "n")   -> number
// get({ n: 2, s: "a" }, "s")   -> string
// get({ n: 2, s: "a" }, "x")   -> erro de typecheck

// Use com um registro novo criado por você:
// const registro = ___;
// const valor = get(registro, ___);

// Limite: se `registro` veio de JSON.parse com um cast, o que este tipo garante de verdade? ___
