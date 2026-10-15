// Troque as três funções por implementações reais. Use os nomes exatos.
// paraBase64(bytes): use bytes.toBase64() quando existir; senão, btoa sobre a string binária dos bytes.
// deBase64(texto): use Uint8Array.fromBase64(texto) quando existir; senão, use atob.
// paraHex(bytes): use bytes.toHex() quando existir; senão, monte dois dígitos por byte.
export function paraBase64(bytes) {
  return '';
}

export function deBase64(texto) {
  return new Uint8Array();
}

export function paraHex(bytes) {
  return '';
}
