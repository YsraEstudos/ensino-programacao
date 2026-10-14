// 16.02 · Rótulo de preço com narrowing.
// Monte format com os blocos. Um bloco usa truthiness e quebra o contrato: deixe-o de fora.
// Contrato: null -> "—"; number -> String(x) (0 vira "0"); string -> texto sem espaços nas bordas.

export function format(x: string | number | null): string {
  // cole aqui os blocos, na ordem escolhida
}

/* Blocos (embaralhados)
[K] return x.trim();
[L] if (!x) return "—";
[M] if (typeof x === "number") return String(x);
[N] if (x === null) return "—";
*/

// Saídas para conferir:
// format(null)  -> "—"
// format(2)     -> "2"
// format(0)     -> "0"
// format(" a ") -> "a"
// Seus valores: ___
