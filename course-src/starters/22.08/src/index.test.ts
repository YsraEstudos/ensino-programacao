// Testes do código-fonte: `node --test src/index.test.ts`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { centavosParaTexto, somarCentavos } from "./index.ts";

test("formata em pt-BR", () => {
  assert.match(centavosParaTexto(1990), /19,90/);
});

test("soma e rejeita inválidos", () => {
  assert.equal(somarCentavos([100, 250]), 350);
  assert.throws(() => somarCentavos([1.5]), RangeError);
});
