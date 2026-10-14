// Só apresentação: transforma centavos em texto para o cabeçalho.
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarLimite(limiteCentavos) {
  return `limite: até ${moeda.format(limiteCentavos / 100)}`;
}
