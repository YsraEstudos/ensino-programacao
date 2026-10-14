export function parseLinha(texto) { const out = {}; for (const part of texto.split(';')) { const [key, value] = part.split('='); if (!(key in out)) out[key] = value; } return out; }
