export function resumoDoacoes(doacoes) {
  const totais = new Map();
  const doadores = new Set();
  for (const { campanha, doador, valor } of doacoes) {
    totais.set(campanha, (totais.get(campanha) ?? 0) + valor);
    doadores.add(doador);
  }
  let maiorCampanha = null;
  let maiorTotal = -Infinity;
  for (const [campanha, total] of totais) {
    if (total > maiorTotal) {
      maiorTotal = total;
      maiorCampanha = campanha;
    }
  }
  return { totais, doadores, maiorCampanha };
}
