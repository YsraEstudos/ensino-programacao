// Suíte existente: `node --test legado.test.js`. Ela precisa continuar verde a cada passo.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { cadastrarCliente, atualizarCliente, disco } from "./legado.js";

beforeEach(() => {
  disco.arquivos.clear();
  disco.escritas = 0;
});

test("cadastra e normaliza", () => {
  const r = cadastrarCliente(" Ana ", " ANA@EX.COM ", "30");
  assert.deepEqual(r, { ok: true, cliente: { id: 1, nome: "Ana", email: "ana@ex.com", idade: 30 } });
});

test("entrada inválida não escreve nada", () => {
  assert.deepEqual(cadastrarCliente("", "a@b", 20), { ok: false, erro: "nome obrigatório" });
  assert.deepEqual(cadastrarCliente("A", "sem-arroba", 20), { ok: false, erro: "email inválido" });
  assert.deepEqual(cadastrarCliente("A", "a@b", 17), { ok: false, erro: "idade mínima 18" });
  assert.equal(disco.escritas, 0);
});

test("email duplicado", () => {
  cadastrarCliente("Ana", "a@b", 20);
  assert.deepEqual(cadastrarCliente("Bia", "A@B", 20), { ok: false, erro: "email já cadastrado" });
});

test("atualiza existente e recusa ausente", () => {
  cadastrarCliente("Ana", "a@b", 20);
  assert.deepEqual(atualizarCliente(1, "Ana Maria", "a@b", 21), { ok: true });
  assert.deepEqual(atualizarCliente(9, "X", "x@y", 30), { ok: false, erro: "cliente não encontrado" });
});
