// Suíte de caracterização: node --test legado.test.js; mantenha-a verde em cada checkpoint.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { cadastrarCliente, criarCadastroCliente, atualizarCliente, disco } from "./legado.js";

beforeEach(() => { disco.arquivos.clear(); disco.escritas = 0; });

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

test("API com repositório preserva formato, normalização e chamadas", () => {
  const calls = [];
  const repo = {
    rows: [],
    listar() { calls.push("listar"); return this.rows.map(row => ({ ...row })); },
    salvar(cliente) { calls.push("salvar"); this.rows.push({ ...cliente }); },
    atualizar(cliente) { calls.push("atualizar"); this.rows = this.rows.map(row => row.id === cliente.id ? { ...cliente } : row); },
    registrar(...args) { calls.push(["registrar", ...args]); },
  };
  assert.deepEqual(criarCadastroCliente(repo, " Ana ", " ANA@EXAMPLE.COM ", "18"), {
    ok: true, cliente: { id: 1, nome: "Ana", email: "ana@example.com", idade: 18 },
  });
  assert.deepEqual(calls, ["listar", "salvar", ["registrar", "cadastro", "ana@example.com"]]);
  assert.deepEqual(atualizarCliente(repo, "1", "Ana Maria", "ANA@EXAMPLE.COM", 19), { ok: true });
  assert.deepEqual(calls.slice(-3), ["listar", "atualizar", ["registrar", "atualização", "1"]]);
});

test("falhas não gravam nem registram", () => {
  const calls = [];
  const repo = { listar() { calls.push("listar"); return [{ id: 1, nome: "A", email: "a@x", idade: 20 }]; }, salvar() { calls.push("salvar"); }, atualizar() { calls.push("atualizar"); }, registrar() { calls.push("registrar"); } };
  assert.deepEqual(criarCadastroCliente(repo, "", "b@y", 20), { ok: false, erro: "nome obrigatório" });
  assert.deepEqual(criarCadastroCliente(repo, "B", "A@X", 20), { ok: false, erro: "email já cadastrado" });
  assert.deepEqual(atualizarCliente(repo, 99, "B", "b@y", 20), { ok: false, erro: "cliente não encontrado" });
  assert.deepEqual(calls, ["listar", "listar"]);
});
