export function parseIsoDate(text) { return Date.parse(text); }
export function isFresh(savedMs, nowMs, ttlMs) { if (ttlMs < 0) throw new RangeError('ttl'); return Date.now() - savedMs < ttlMs; }
