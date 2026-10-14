// Teste de contrato: todo adapter de Repositorio deve passar nesta mesma suíte.
import { test } from "node:test";
import assert from "node:assert/strict";
import { criar, estadoInicial } from "../src/dominio.ts";
import { criarRepositorioEmMemoria } from "../src/adapters/memoria.ts";

const adapters = { memoria: () => criarRepositorioEmMemoria() };

for (const [nome, fabricar] of Object.entries(adapters)) {
  test(`${nome}: salva e recupera (simula reinício)`, async () => {
    const repositorio = fabricar();
    await repositorio.salvar(criar(estadoInicial, "t1", "Estudar"));
    const recuperado = await repositorio.carregar();
    assert.equal(recuperado.tarefas[0]?.titulo, "Estudar");
  });
}

test("dado inválido é rejeitado antes de mutar", () => {
  assert.throws(() => criar(estadoInicial, "t1", "   "));
  assert.equal(estadoInicial.tarefas.length, 0);
});

// Acrescente: mover/remover, falha de storage (falharProximo) e o serviço que liga domínio e porta.
