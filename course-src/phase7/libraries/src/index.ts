import {normalizar} from './interno.js';
export type {Opcoes} from './interno.js';
export const VERSAO: string = '1.1.0';
export const padroes: {separador:string;maximo:number} = {separador:'-',maximo:60};
export function criarSlug(texto:string):string { return normalizar(texto); /* TODO preservar API22.09 */ }
export function limitar(texto:string,maximo?:number):string;
export function limitar(texto:string,opcoes:{maximo:number}):string;
export function limitar(texto:string,opcoes:number|{maximo:number}=padroes.maximo):string {
  void opcoes; return texto; // TODO compatibilidade numérica, objeto e default
}
