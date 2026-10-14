// @ts-check

/**
 * Calcula o frete em unidades monetárias para um peso positivo em kg.
 * @param {number} pesoKg
 * @param {boolean} [expressa=false]
 * @returns {number}
 */
export function calcularFrete(pesoKg, expressa = false) {
  if (!Number.isFinite(pesoKg) || pesoKg <= 0) {
    throw new RangeError('O peso deve ser positivo e finito.');
  }
  return pesoKg * (expressa ? 10 : 8);
}
