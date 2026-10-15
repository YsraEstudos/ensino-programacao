export class ErroPagamento extends Error {
  constructor(mensagem, opcoes) {
    super(mensagem, opcoes);
    this.name = 'ErroPagamento';
  }
}

export function pagar(valor, gateway) {
  if (valor <= 0) throw new ErroPagamento('valor deve ser positivo');
  try {
    return gateway.cobrar(valor);
  } catch (erro) {
    throw new ErroPagamento('falha ao cobrar', { cause: erro });
  }
}

export function ehErro(valor) {
  return typeof Error.isError === 'function' ? Error.isError(valor) : valor instanceof Error;
}
