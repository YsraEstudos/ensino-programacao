export function resumirNota(pontos) {
  const faixa = pontos >= 60 ? "aprovar" : "revisar";
  let situacao = "";

  if (pontos < 0) {
    situacao = "inválida";
  } else if (pontos < 60) {
    situacao = "em revisão";
  } else {
    situacao = "liberada";
  }

  return { faixa, situacao };
}
