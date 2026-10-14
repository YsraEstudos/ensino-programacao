import {aplicarPatch,type Usuario} from '../patch.js';
const u:Usuario={id:1,nome:'Ana',perfil:{nome:'alto contraste',tema:'escuro'}};const atual=aplicarPatch(u,{nome:'Bia'});const id:number=atual.id;
// @ts-expect-error chave desconhecida
aplicarPatch(u,{apelido:'B'});
// @ts-expect-error nome tem tipo string
aplicarPatch(u,{nome:2});
