// @ts-check

/**
 * Calcula o frete em unidades monetárias para um peso positivo em kg.
 * @param {string} pesoKg
 * @param {boolean} [expressa=false]
 * @returns {string}
 */
export function calcularFrete(pesoKg, expressa = false) {
  if (!Number.isFinite(pesoKg) || pesoKg <= 0) {
    throw new RangeError('O peso deve ser positivo e finito.');
  }
  // Implemente: frete comum custa 8 por kg; expresso custa 10 por kg.
  return 0;
}
