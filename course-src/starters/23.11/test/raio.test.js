import { test } from "node:test";
import assert from "node:assert/strict";
import { dentroDoRaio } from "../src/domain/raio.js";

test("abaixo e acima do raio", () => {
  assert.equal(dentroDoRaio(4_999), true);
  assert.equal(dentroDoRaio(5_001), false);
});

test("rejeita distância negativa", () => {
  assert.throws(() => dentroDoRaio(-1), RangeError);
});
