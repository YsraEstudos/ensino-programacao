import {normalizar} from './interno.js';
export type {Opcoes} from './interno.js';
export const VERSAO: string = '2.0.0';
export const padroes: {separador:string;maximo:number} = {separador:'-',maximo:60};
export function criarSlug(texto:string):string { return normalizar(texto); /* TODO mesma semântica */ }
export function limitar(texto:string,opcoes:{maximo:number}={maximo:padroes.maximo}):string {
  void opcoes; return texto; // TODO validar fronteira JS, remover somente overload numérico
}
