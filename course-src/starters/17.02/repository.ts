export type Entity={id:string};
export function pair(key:string,value:string){return [key,value];}
export function wrap<T>(value:T){return {value};}
export interface Repository<T extends Entity,ID= T['id']>{save(value:T):void;get(id:ID):T|undefined;}
