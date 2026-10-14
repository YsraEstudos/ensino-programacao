// 22.09 · Ative isolatedDeclarations (tsconfig.json) e rode `npx tsc`.
// Cada export cujo tipo depende de inferência vai pedir anotação explícita.
import { normalizar } from "./interno.ts";

export const VERSAO = "1.0.0";

export function criarSlug(texto: string) {
  return normalizar(texto).replaceAll(" ", "-");
}

export const padroes = { separador: "-", maximo: 60 };

export function limitar(texto: string, maximo = padroes.maximo) {
  return texto.length > maximo ? texto.slice(0, maximo) : texto;
}

export type { Opcoes } from "./interno.ts";
