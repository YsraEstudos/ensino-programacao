// Nota com uma casa decimal e vírgula, como na secretaria.
export function formatarNota(valor) {
  return valor.toFixed(1).replace('.', ',');
}
