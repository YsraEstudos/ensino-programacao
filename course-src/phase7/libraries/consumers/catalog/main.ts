import {criarSlug} from '@curso/slug-kit';
export const catalogo = [
  {id:'a',titulo:'  Ação  Clara '},
  {id:'b',titulo:'Café com Leite'}
].map(item=>({...item,slug:criarSlug(item.titulo)}));
