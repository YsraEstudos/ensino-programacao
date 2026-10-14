export function parseIsoDate(text) { const value = Date.parse(text); return Number.isFinite(value) ? value : NaN; }
export function isFresh(savedMs, nowMs, ttlMs) { if (ttlMs < 0) throw new RangeError('ttl'); return Number.isFinite(savedMs) && Number.isFinite(nowMs) && nowMs - savedMs < ttlMs; }
