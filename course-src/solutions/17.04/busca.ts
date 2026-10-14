export function primeiro<T>(xs:T[]):T|undefined { return xs[0]; }
export function buscarPorId<T extends {id:string}>(xs:T[],id:string):T|undefined { return xs.find(x=>x.id===id); }
export const n=primeiro([1,2]); export const objeto=primeiro([{id:"x"}]); export const achado=buscarPorId(objeto?[objeto]:[],"x");
