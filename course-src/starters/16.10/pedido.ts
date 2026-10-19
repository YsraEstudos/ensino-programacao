// 16.10 · Salvar pedido: em modo strict, o valor capturado é `unknown`.
// Corrija a captura: trate Error e valor que não é Error, mostre uma mensagem pública segura
// e relance um novo Error que preserve o valor original em `cause`.

export async function salvar(pedido: { id: string }, falha: unknown): Promise<void> {
  if (falha !== undefined) throw falha;
  console.log("salvo", pedido.id);
}

export async function salvarPedido(pedido: { id: string }, falha?: unknown): Promise<string> {
  try {
    await salvar(pedido, falha);
    return "Pedido salvo.";
  } catch (e) {
    return `Falhou: ${e.message}`;
  }
}

// Casos para conferir:
// salvarPedido({ id: "p1" })                       -> "Pedido salvo."
// salvarPedido({ id: "p1" }, new Error("disco"))   -> rejeita com "Não foi possível salvar o pedido."; cause preservada
// salvarPedido({ id: "p1" }, "falhou")             -> mesma mensagem pública; cause preservada
// salvarPedido({ id: "p1" }, { codigo: 503 })      -> não acessar .message de um objeto qualquer
