import { criarRepositorioEmMemoria } from "./storage/memoria.js";
import { gerarRelatorio } from "./service/relatorio.js";
import { renderizarTabela } from "./ui/tabela.js";

const repositorio = criarRepositorioEmMemoria([
  { id: "p1", valorCentavos: 9_999 },
  { id: "p2", valorCentavos: 10_000 },
  { id: "p3", valorCentavos: 10_001 },
  { id: "p4", valorCentavos: 15_000 },
]);

console.log(renderizarTabela(gerarRelatorio(repositorio)));
