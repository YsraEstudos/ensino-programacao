import {normalizar} from './interno.js';
export type {Opcoes} from './interno.js';
export const VERSAO: string = '2.0.0';
export const padroes: {separador:string;maximo:number} = {separador:'-',maximo:60};
export function criarSlug(texto:string):string { return normalizar(texto).replaceAll(' ','-'); }
export function limitar(texto:string,opcoes:{maximo:number}={maximo:padroes.maximo}):string {
  if(typeof opcoes!=='object'||opcoes===null)throw new TypeError('Use {maximo} em2.0.0');
  const maximo=opcoes.maximo;
  return texto.length>maximo ? texto.slice(0,maximo) : texto;
}
