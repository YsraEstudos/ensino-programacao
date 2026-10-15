// Defina ErroPagamento com name e cause, pagar com erro de domínio e ehErro com Error.isError (fallback: instanceof Error).
export class ErroPagamento extends Error {}

export function pagar(valor, gateway) {
  return undefined;
}

export function ehErro(valor) {
  return false;
}
