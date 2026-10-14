export type Usuario={nome:string; idade:number; criadoEm:string};
export function criarUsuario(nome:string, idade:number):Usuario { const limpo=nome.trim(); if (idade<13) throw new RangeError('Idade mínima: 13'); return {nome:limpo,idade,criadoEm:new Date().toISOString()}; }
