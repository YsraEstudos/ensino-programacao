export function memoizeLRU(fn, limit = 2) {
  const cache = new Map();
  return function memoized(key) {
    if (limit <= 0) return fn.call(this, key);
    if (cache.has(key)) {
      const value = cache.get(key);
      cache.delete(key);
      cache.set(key, value);
      return value;
    }
    cache.set(key, undefined);
    const value = fn.call(this, key);
    cache.set(key, value);
    if (cache.size > limit) cache.delete(cache.keys().next().value);
    return value;
  };
}
