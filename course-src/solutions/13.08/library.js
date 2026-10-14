export function clamp(valor, minimo, maximo) { if (minimo > maximo) throw new RangeError('intervalo inválido'); return Math.min(maximo, Math.max(minimo, valor)); }
export function unique(valores) { return [...new Set(valores)]; }
export function paginar(valores, pagina, tamanho) { if (!Number.isInteger(pagina) || pagina < 1 || !Number.isInteger(tamanho) || tamanho < 1) throw new RangeError('intervalo inválido'); return valores.slice((pagina - 1) * tamanho, pagina * tamanho); }
