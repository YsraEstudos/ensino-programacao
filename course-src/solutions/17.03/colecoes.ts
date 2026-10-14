export function map<T,U>(xs:readonly T[],fn:(x:T,index:number)=>U):U[] { const saida:U[]=[]; for(let i=0;i<xs.length;i++) saida.push(fn(xs[i] as T,i)); return saida; }
export function filter<T>(xs:readonly T[],predicate:(x:T,index:number)=>boolean):T[] { const saida:T[]=[]; xs.forEach((x,i)=>{if(predicate(x,i))saida.push(x);}); return saida; }
