export const CARENCIA_DIAS = 2;
export const TAXA_CENTAVOS_POR_DIA = 50;
export const TETO_CENTAVOS = 2000;

// Atraso que gera multa: só depois da carência.
export function temMulta(diasAtraso) {
  return diasAtraso > CARENCIA_DIAS;
}

export function multaCentavos(diasAtraso) {
  if (!temMulta(diasAtraso)) return 0;
  return (diasAtraso - CARENCIA_DIAS) * TAXA_CENTAVOS_POR_DIA;
}
