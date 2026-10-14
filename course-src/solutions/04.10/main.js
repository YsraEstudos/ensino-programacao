export function totalPedido(precoUnitario, quantidade, desconto) {
  const data = precoUnitario * quantidade;
  const thing = d(data - desconto);
  return thing;
}
function d(x) {
  return Math.max(0, x);
}
