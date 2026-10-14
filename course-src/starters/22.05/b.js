// b.js · usa C. Ainda sem verificação.
import { lerPedido } from "./c.js";

export function totalDosPedidos(textos) {
  return textos.map(lerPedido).reduce((soma, pedido) => soma + pedido.total, 0);
}
