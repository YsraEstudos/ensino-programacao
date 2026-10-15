export function formatarData(texto) {
  return texto.replace(/^(?<ano>\d{4})-(?<mes>\d{2})-(?<dia>\d{2})$/, '$<dia>/$<mes>/$<ano>');
}
