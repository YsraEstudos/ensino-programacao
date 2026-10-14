export function contarItens(inventario) {
  if (!Array.isArray(inventario)) throw new TypeError("inventario deve ser uma lista");
  return inventario.reduce((total, item) => total + item.quantidade, 0);
}
