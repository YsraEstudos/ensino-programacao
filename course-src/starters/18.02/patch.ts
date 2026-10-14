export type Perfil={nome:string;tema:'claro'|'escuro'}; export type Usuario={id:number;nome:string;perfil:Perfil};
export function aplicarPatch<T extends object>(base:T,patch:any):T{return {...base,...patch};}
