import { formatarLimite } from "./formatar-limite.js";

export function renderizarTabela(relatorio) {
  return [
    `Relatório (${formatarLimite(relatorio.limiteCentavos)})`,
    `Dentro: ${relatorio.dentro.join(", ") || "nenhum"}`,
    `Fora: ${relatorio.fora.join(", ") || "nenhum"}`,
    `Total: ${relatorio.total}`,
  ].join("\n");
}
