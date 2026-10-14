export function calcularTotal(preco, quantidade) {
  return preco * quantidade;
}

export const formatadorBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const formatadorPercentual = new Intl.NumberFormat("pt-BR", { style: "percent" });
export const formatadorCompacto = new Intl.NumberFormat("pt-BR", { notation: "compact" });
