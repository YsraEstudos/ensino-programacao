// Rode com `node --test upload.test.ts` (Node.js 24 remove os tipos).
import { test } from "node:test";
import assert from "node:assert/strict";
import { reducer } from "./upload.ts";

test("fluxo feliz", () => {
  const selecionando = reducer({ status: "idle" }, { type: "select" });
  assert.deepEqual(selecionando, { status: "selecting" });
  const enviando = reducer(selecionando, { type: "start" });
  assert.deepEqual(enviando, { status: "uploading", progress: 0 });
  assert.deepEqual(reducer(enviando, { type: "resolve", url: "/r/1.png" }), { status: "success", url: "/r/1.png" });
});

test("fronteira de progress", () => {
  const enviando = { status: "uploading", progress: 0 } as const;
  assert.deepEqual(reducer(enviando, { type: "progress", valor: 100 }), { status: "uploading", progress: 100 });
  assert.throws(() => reducer(enviando, { type: "progress", valor: 101 }), RangeError);
});

test("ação incompatível mantém o estado", () => {
  const inicial = { status: "idle" } as const;
  assert.equal(reducer(inicial, { type: "progress", valor: 10 }), inicial);
});
