import { test } from "node:test";
import assert from "node:assert/strict";
import { gerarRelatorio } from "../src/service/relatorio.js";
import { criarRepositorioEmMemoria } from "../src/storage/memoria.js";

test("separa pedidos pelo limite informado", () => {
  const repositorio = criarRepositorioEmMemoria([
    { id: "a", valorCentavos: 500 },
    { id: "b", valorCentavos: 2_000 },
  ]);
  assert.deepEqual(gerarRelatorio(repositorio, 1_000), {
    limiteCentavos: 1_000,
    total: 2,
    dentro: ["a"],
    fora: ["b"],
  });
});
