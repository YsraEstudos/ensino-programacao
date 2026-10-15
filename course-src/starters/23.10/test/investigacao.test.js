import { test } from "node:test";
import assert from "node:assert/strict";
import { LIMITE_PADRAO_CENTAVOS, dentroDoLimite } from "../src/domain/limite.js";
import { gerarRelatorio } from "../src/service/relatorio.js";
import { criarRepositorioEmMemoria } from "../src/storage/memoria.js";

// Sonda de leitura: confere previsões sobre o comportamento atual. Não define a regra desejada.
// Se alguma assertiva falhar, a previsão estava errada: registre a diferença na resposta 3, não edite src/.

test("previsão: fronteira no limite padrão", () => {
  assert.equal(LIMITE_PADRAO_CENTAVOS, 10000);
  assert.equal(dentroDoLimite(10000), true);
  assert.equal(dentroDoLimite(10001), false);
});

test("observação: valor negativo passa hoje, sem erro", () => {
  assert.equal(dentroDoLimite(-1), true);
});

test("observação: o relatório separa pedidos pelo limite padrão", () => {
  const repositorio = criarRepositorioEmMemoria([
    { id: "p1", valorCentavos: 9999 },
    { id: "p2", valorCentavos: 10001 },
  ]);
  assert.deepEqual(gerarRelatorio(repositorio).dentro, ["p1"]);
});
