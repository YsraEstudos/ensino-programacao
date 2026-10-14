// 22.08 · Biblioteca publicável: duas funções, tipos explícitos na API pública.

export type Moeda = "BRL" | "USD";

export function centavosParaTexto(centavos: number, moeda: Moeda = "BRL"): string {
  if (!Number.isSafeInteger(centavos)) throw new RangeError("centavos precisa ser inteiro seguro");
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda }).format(centavos / 100);
}

export function somarCentavos(valores: readonly number[]): number {
  // implemente: soma inteiros seguros; valor inválido lança RangeError
}
