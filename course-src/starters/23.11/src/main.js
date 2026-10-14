import { criarRepositorioEmMemoria } from "./storage/memoria.js";
import { gerarRelatorio } from "./service/relatorio.js";
import { renderizarTabela } from "./ui/tabela.js";

const repositorio = criarRepositorioEmMemoria([
  { id: "e1", distanciaMetros: 4_999 },
  { id: "e2", distanciaMetros: 5_000 },
  { id: "e3", distanciaMetros: 5_001 },
]);

console.log(renderizarTabela(gerarRelatorio(repositorio)));
