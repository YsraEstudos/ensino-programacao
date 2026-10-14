export function clamp(value:number,min:number,max:number):number { if (min>max) throw new RangeError('Faixa inválida'); return Math.min(max,Math.max(min,value)); }
export function unique<T>(items:readonly T[]):T[] { return [...new Set(items)]; }
export function paginar<T>(items:readonly T[],pagina:number,tamanho:number):T[] { if (!Number.isInteger(pagina)||pagina<1||!Number.isInteger(tamanho)||tamanho<1) throw new RangeError('Página e tamanho devem ser inteiros positivos'); return items.slice((pagina-1)*tamanho,pagina*tamanho); }
