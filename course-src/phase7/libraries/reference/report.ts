import {limitar} from '@curso/slug-kit';
export function relatorio<T extends {id:string;titulo:string}>(itens:readonly T[]):{origem:T;id:string;resumo:string}[] {
  return itens.map(origem=>({origem,id:origem.id,resumo:limitar(origem.titulo,{maximo:5})}));
}
