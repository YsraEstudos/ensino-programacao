export function clamp(v,a,b){return Math.min(b,Math.max(a,v));} export function unique(v){return [...new Set(v)];} export function paginar(v,p,s){return v.splice((p-1)*s,s);}
