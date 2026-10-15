// Texto para o balcão. Recebe uma linha já calculada e só formata.
export function textoMulta(linha) {
  const reais = (linha.multaCentavos / 100).toFixed(2).replace('.', ',');
  return `${linha.id}: ${linha.diasAtraso} dias, R$ ${reais}`;
}
