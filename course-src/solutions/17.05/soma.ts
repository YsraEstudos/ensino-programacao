export function soma(xs:readonly number[]):number { let total=0; for(const x of xs) total+=x; return total; }
const fixos=[1,2] as const; const lista:readonly number[]=[3,4]; export const a=soma(fixos); export const b=soma(lista); export const c=soma([1,2]);
