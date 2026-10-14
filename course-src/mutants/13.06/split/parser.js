export function parseLinha(texto) { return Object.fromEntries(texto.split(';').map(part => part.split('='))); }
