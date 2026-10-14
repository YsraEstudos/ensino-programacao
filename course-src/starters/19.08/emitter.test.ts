// Escreva primeiro: o teste do par evento-payload. Rode com `node --test emitter.test.ts`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Emitter, type Events } from "./emitter.ts";

test("listener recebe o payload do próprio evento", () => {
  const emitter = new Emitter<Events>();
  const recebidos: Events["itemAdded"][] = [];
  emitter.on("itemAdded", (payload) => recebidos.push(payload));
  emitter.emit("itemAdded", { sku: "sku-1" });
  assert.deepEqual(recebidos, [{ sku: "sku-1" }]);
});

test("off impede a próxima emissão", () => {
  const emitter = new Emitter<Events>();
  let chamadas = 0;
  const listener = () => { chamadas++; };
  emitter.on("itemRemoved", listener);
  emitter.off("itemRemoved", listener);
  emitter.emit("itemRemoved", { sku: "sku-1" });
  assert.equal(chamadas, 0);
});

test("off é idempotente e listeners de eventos diferentes são isolados", () => {
  const emitter = new Emitter<Events>();
  let itensAdicionados = 0;
  let preçosAlterados = 0;
  const item = () => { itensAdicionados++; };
  emitter.on("itemAdded", item);
  emitter.on("priceChanged", () => { preçosAlterados++; });
  emitter.off("itemAdded", item);
  emitter.off("itemAdded", item);
  emitter.emit("itemAdded", { sku: "sku-2" });
  emitter.emit("priceChanged", { sku: "sku-2", price: 3 });
  assert.equal(itensAdicionados, 0);
  assert.equal(preçosAlterados, 1);
});

// Type tests: estas linhas devem continuar com erro de typecheck.
// @ts-expect-error sku precisa ser string
new Emitter<Events>().emit("itemAdded", { sku: 1 });
