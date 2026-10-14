// Módulo com efeito colateral: avaliar este arquivo incrementa um contador global.
const global = globalThis as { carregamentos?: number };
global.carregamentos = (global.carregamentos ?? 0) + 1;
console.log("side carregado", global.carregamentos);

export type Schema = { campos: string[] };

export function init(schema: Schema): void {
  console.log("init", schema.campos.join(","));
}
