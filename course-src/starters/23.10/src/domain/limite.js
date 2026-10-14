// Regra de negócio: o pedido está dentro do limite quando o valor é menor ou igual ao limite.
export const LIMITE_PADRAO_CENTAVOS = 10_000;

export function dentroDoLimite(valorCentavos, limiteCentavos = LIMITE_PADRAO_CENTAVOS) {
  if (!Number.isSafeInteger(valorCentavos) || !Number.isSafeInteger(limiteCentavos)) {
    throw new RangeError("valores em centavos inteiros");
  }
  return valorCentavos <= limiteCentavos;
}
