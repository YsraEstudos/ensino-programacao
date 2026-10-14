import{lerPedido}from'./c.js';export function subtotal(json){const pedido=lerPedido(json);return pedido.quantidade*pedido.preco;}
