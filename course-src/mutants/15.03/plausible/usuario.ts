export type Usuario={nome:string;idade:number;criadoEm:string}; export function criarUsuario(nome:string,idade:number):Usuario { return {nome,idade,criadoEm:new Date(0).toISOString()}; }
