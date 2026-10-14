export function format(x:string|number|null):string { if(x===null)return "—"; if(typeof x==="number")return String(x); return x.trim(); }
