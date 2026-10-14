// 04.05 · Cálculo e apresentação são contratos diferentes.
// calcularTotal devolve um Number. Os três formatadores recebem um número e devolvem texto em pt-BR.
// Substitua cada `null` por um `new Intl.NumberFormat("pt-BR", { ...opções })` (consulte a documentação das opções).

export function calcularTotal(preco, quantidade) {
  return preco * quantidade;
}

// moeda brasileira: R$ 20,00
export const formatadorBRL = null;

// percentual: 0,25 vira 25%
export const formatadorPercentual = null;

// notação compacta: 1200 vira algo como "1,2 mil"
export const formatadorCompacto = null;
