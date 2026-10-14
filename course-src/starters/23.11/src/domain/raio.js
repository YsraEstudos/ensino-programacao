// Regra de negócio: a loja atende entregas até o raio, inclusive.
export const RAIO_PADRAO_METROS = 5_000;

export function dentroDoRaio(distanciaMetros, raioMetros = RAIO_PADRAO_METROS) {
  if (!Number.isFinite(distanciaMetros) || distanciaMetros < 0) {
    throw new RangeError("distância inválida");
  }
  return distanciaMetros < raioMetros;
}
