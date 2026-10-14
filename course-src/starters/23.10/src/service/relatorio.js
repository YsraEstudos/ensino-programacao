import { LIMITE_PADRAO_CENTAVOS, dentroDoLimite } from "../domain/limite.js";

export function gerarRelatorio(repositorio, limiteCentavos = LIMITE_PADRAO_CENTAVOS) {
  const pedidos = repositorio.listar();
  const dentro = [];
  const fora = [];
  for (const pedido of pedidos) {
    (dentroDoLimite(pedido.valorCentavos, limiteCentavos) ? dentro : fora).push(pedido.id);
  }
  return { limiteCentavos, total: pedidos.length, dentro, fora };
}
