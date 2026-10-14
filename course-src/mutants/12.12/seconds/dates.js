export function parseIsoDate(text) { return Date.parse(text); }
export function isFresh(savedMs, nowMs, ttlMs) { if (ttlMs < 0) throw new RangeError('ttl'); return Number.isFinite(savedMs) && (nowMs - savedMs) / 1000 < ttlMs; }
