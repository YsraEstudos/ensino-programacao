// Só apresentação: transforma metros em texto para o cabeçalho.
export function formatarRaio(raioMetros) {
  return `raio: até ${(raioMetros / 1000).toLocaleString("pt-BR")} km`;
}
