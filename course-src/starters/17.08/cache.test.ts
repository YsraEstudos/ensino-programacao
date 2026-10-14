// Rode com `node --test cache.test.ts`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Cache } from "./cache.ts";

function relogio(inicio = 0) {
  let agora = inicio;
  return { agora: () => agora, avancar: (ms: number) => { agora += ms; } };
}

test("expira exatamente em expiresAt", () => {
  const tempo = relogio();
  const cache = new Cache<string, number>(tempo.agora);
  cache.set("a", 1, 100);
  tempo.avancar(99);
  assert.equal(cache.get("a"), 1);
  tempo.avancar(1);
  assert.equal(cache.get("a"), undefined);
  assert.equal(cache.has("a"), false);
});

test("0 e undefined são valores válidos", () => {
  const tempo = relogio();
  const cache = new Cache<string, number | undefined>(tempo.agora);
  cache.set("zero", 0, 10);
  cache.set("vazio", undefined, 10);
  assert.equal(cache.get("zero"), 0);
  assert.equal(cache.has("vazio"), true);
  assert.equal(cache.has("nunca"), false);
});

test("ttl negativo", () => {
  assert.throws(() => new Cache<string, number>().set("a", 1, -1), RangeError);
});
