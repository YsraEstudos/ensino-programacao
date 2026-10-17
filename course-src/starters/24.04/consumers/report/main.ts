import {limitar} from '@curso/slug-kit';
// Tentativa de migração L-43: confira tamanho, ordem e identidade.
export function relatorio<T extends {id:string;titulo:string}>(itens:readonly T[]):{origem:T;id:string;resumo:string}[] {
  return itens.map(origem=>({origem,id:origem.id,resumo:limitar(origem.titulo,{maximo:6})}));
}
