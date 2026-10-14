export function adicionarTaxa(subtotalCentavos, taxa) {
  const impostoCentavos = Math.round(subtotalCentavos * taxa);
  return subtotalCentavos + impostoCentavos;
}

export function aplicarCupom(valorCentavos, descontoCentavos) {
  return Math.max(0, valorCentavos - descontoCentavos);
}

export function totalFinal(subtotalCentavos, taxa, descontoCentavos) {
  return aplicarCupom(adicionarTaxa(subtotalCentavos, taxa), descontoCentavos);
}
