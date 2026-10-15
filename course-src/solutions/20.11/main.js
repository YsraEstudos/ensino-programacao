export function paraBase64(bytes) {
  if (typeof bytes.toBase64 === 'function') return bytes.toBase64();
  return btoa(String.fromCharCode(...bytes));
}

export function deBase64(texto) {
  if (typeof Uint8Array.fromBase64 === 'function') return Uint8Array.fromBase64(texto);
  return Uint8Array.from(atob(texto), caractere => caractere.charCodeAt(0));
}

export function paraHex(bytes) {
  if (typeof bytes.toHex === 'function') return bytes.toHex();
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}
