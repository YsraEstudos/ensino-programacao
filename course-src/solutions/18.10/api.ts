type User={id:string;nome:string}; type Result={ok:true;valor:number}|{ok:false;erro:string}; export type Evento="ok"|"error"|"retry";
export async function loadUser(id:string):Promise<User|null>{return id==="u1"?{id,nome:"Ana"}:null;} export function handle(input:string):Result{return input==="ok"?{ok:true,valor:1}:{ok:false,erro:input};}
export type LoadedUser=Awaited<ReturnType<typeof loadUser>>; export type PresentUser=NonNullable<LoadedUser>; export type HandleInput=Parameters<typeof handle>[0]; export type SemErro=Exclude<Evento,"error">; export type SoErro=Extract<Evento,"error">;
