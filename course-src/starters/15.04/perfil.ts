// 15.04 · Leitor de perfil que recebe payload externo.
// Hoje `any` desliga a verificação: o compilador aceita qualquer acesso.
// Troque `any` por `unknown`, prove cada passo com guardas e lance TypeError
// com mensagem clara quando a forma não for a esperada.

export function ler(payload: any): string {
  return payload.user.name.toUpperCase();
}

// Casos para conferir:
// ler({ user: { name: "Ana" } }) -> "ANA"
// ler(null)                      -> TypeError com a sua mensagem, não "Cannot read properties of null"
// ler({})                        -> TypeError
// ler({ user: { name: 42 } })    -> TypeError
// Seus casos: ___
