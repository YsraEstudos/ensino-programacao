import { test } from "node:test";
import assert from "node:assert/strict";
import { gerarRelatorio } from "../src/service/relatorio.js";
import { criarRepositorioEmMemoria } from "../src/storage/memoria.js";

test("separa entregas pelo raio informado", () => {
  const repositorio = criarRepositorioEmMemoria([
    { id: "a", distanciaMetros: 100 },
    { id: "b", distanciaMetros: 9_000 },
  ]);
  assert.deepEqual(gerarRelatorio(repositorio, 1_000), { raioMetros: 1_000, dentro: ["a"], fora: ["b"] });
});
