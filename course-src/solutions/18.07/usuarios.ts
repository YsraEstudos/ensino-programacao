type User={id:string;nome:string}; const porId:Record<string,User>={u1:{id:"u1",nome:"Ana"}};
export function nomeDe(id:string):string { const usuario=porId[id]; if(!Object.hasOwn(porId,id)||!usuario) throw new RangeError("Usuário ausente: "+id); return usuario.nome; }
