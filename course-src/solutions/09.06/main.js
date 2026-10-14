export function memoize(fn) {
  const cache = new Map();
  return function (x) {
    if (cache.has(x)) return cache.get(x);
    const resultado = fn(x);
    cache.set(x, resultado);
    return resultado;
  };
}
