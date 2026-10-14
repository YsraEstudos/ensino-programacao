export type Opcoes = { separador: string; maximo: number };

export function normalizar(texto: string): string {
  return texto.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}
