export function clamp(v,a,b){return Math.min(b,Math.max(a,v));} export function unique(v){return [...v].sort();} export function paginar(v,p,s){return v.slice((p-1)*s,p*s);}
