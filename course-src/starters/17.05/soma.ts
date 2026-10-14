// 17.05 · O contrato pede só leitura.
// Mude a assinatura para aceitar entradas somente de leitura sem pedir capacidade de escrita.

export function soma(xs: number[]): number {
  let total = 0;
  for (const x of xs) total += x;
  return total;
}

const fixos = [1, 2] as const;            // readonly [1, 2]
const lista: readonly number[] = [3, 4];

// Hoje as duas chamadas abaixo falham no typecheck; depois da mudança devem compilar:
export const a = soma(fixos);
export const b = soma(lista);
export const c = soma([1, 2]);            // esperado: 3

// Previsão: se alguém acrescentar xs.push(0) dentro de soma depois da mudança, o que acontece? ___
// readonly copia o array? Um alias externo gravável ainda pode alterá-lo? ___
