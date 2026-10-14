// Suíte de runtime: deve passar antes e depois da migração.
// Antes: `node --test paginacao.test.js`. Depois: troque o import para "./paginacao.ts" e rode de novo.
import { test } from "node:test";
import assert from "node:assert/strict";
import { clamp, unique, paginar } from "./paginacao.js";

test("exemplos publicados", () => {
  assert.equal(clamp(2, 0, 3), 2);
  assert.deepEqual(unique([1, 1, 2]), [1, 2]);
  assert.deepEqual(paginar([1, 2, 3], 2, 2), [3]);
});

test("erros documentados", () => {
  assert.throws(() => clamp(1, 5, 0), RangeError);
  assert.throws(() => paginar([1], 0, 2), RangeError);
  assert.throws(() => paginar([1], 1, 0), RangeError);
});

test("não muta a entrada e preserva a ordem", () => {
  const entrada = [3, 1, 3, Number.NaN, Number.NaN];
  assert.deepEqual(unique(entrada), [3, 1, Number.NaN]);
  assert.deepEqual(entrada, [3, 1, 3, Number.NaN, Number.NaN]);
});
