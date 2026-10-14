export function clamp(valor, minimo, maximo) { if (minimo > maximo) throw new RangeError('intervalo inválido'); return Math.min(maximo, Math.max(minimo, valor)); }
