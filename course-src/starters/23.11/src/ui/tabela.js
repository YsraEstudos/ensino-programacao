import { formatarRaio } from "./formatar-raio.js";

export function renderizarTabela(relatorio) {
  return [
    `Entregas (${formatarRaio(relatorio.raioMetros)})`,
    `Dentro: ${relatorio.dentro.join(", ") || "nenhuma"}`,
    `Fora: ${relatorio.fora.join(", ") || "nenhuma"}`,
  ].join("\n");
}
