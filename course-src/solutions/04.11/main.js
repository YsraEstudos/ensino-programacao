export function validarPercentual(valor) {
  if (typeof valor !== 'number') throw new TypeError('percentual deve ser Number');
  if (!Number.isFinite(valor) || valor < 0 || valor > 100) {
    throw new RangeError('percentual fora de 0 a 100');
  }
  return valor;
}
