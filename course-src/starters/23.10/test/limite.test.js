import { test } from "node:test";
import assert from "node:assert/strict";
import { LIMITE_PADRAO_CENTAVOS, dentroDoLimite } from "../src/domain/limite.js";

test("limite padrão", () => {
  assert.equal(LIMITE_PADRAO_CENTAVOS, 10_000);
});

test("abaixo, no limite e acima", () => {
  assert.equal(dentroDoLimite(9_999), true);
  assert.equal(dentroDoLimite(10_000), true);
  assert.equal(dentroDoLimite(10_001), false);
});

test("rejeita valor não inteiro", () => {
  assert.throws(() => dentroDoLimite(10.5), RangeError);
});
