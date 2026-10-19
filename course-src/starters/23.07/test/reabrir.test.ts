import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Estado } from '../src/dominio.ts';
import { ForbiddenError, reabrir, type EventoAuditoria } from '../src/reabrir.ts';

function criarRepositorio(inicial: Estado) {
  let estado = structuredClone(inicial);
  let eventos: EventoAuditoria[] = [];
  let falhar = false;
  let escritas = 0;
  return {
    async carregar() { return structuredClone(estado); },
    async salvarComEvento(novoEstado: Estado, evento: EventoAuditoria) {
      escritas++;
      if (falhar) { falhar = false; throw new Error('falha simulada'); }
      estado = structuredClone(novoEstado);
      eventos = [...eventos, structuredClone(evento)];
    },
    falharProximo() { falhar = true; },
    eventos: () => structuredClone(eventos),
    escritas: () => escritas,
  };
}

const concluida: Estado = { versao: 1, tarefas: [{ id: 't1', titulo: 'Revisar', coluna: 'feito' }] };

test('admin reabre a tarefa e grava evento com horário injetado', async () => {
  const repositorio = criarRepositorio(concluida);
  const resultado = await reabrir(repositorio, { id: 'a1', papel: 'admin' }, 't1', () => new Date('2026-10-01T00:00:00Z'));
  assert.equal(resultado.tarefas[0]?.coluna, 'a-fazer');
  assert.deepEqual(repositorio.eventos(), [{ tipo: 'reaberta', tarefaId: 't1', por: 'a1', em: '2026-10-01T00:00:00.000Z' }]);
});

test('usuário comum é negado antes de qualquer escrita e tarefa ausente é rejeitada', async () => {
  const repositorio = criarRepositorio(concluida);
  await assert.rejects(reabrir(repositorio, { id: 'u1', papel: 'comum' }, 't1'), ForbiddenError);
  assert.equal(repositorio.escritas(), 0);
  assert.deepEqual(await repositorio.carregar(), concluida);
  await assert.rejects(reabrir(repositorio, { id: 'a1', papel: 'admin' }, 'ausente'));
  assert.equal(repositorio.escritas(), 0);
});

test('falha ao persistir não altera status nem histórico', async () => {
  const repositorio = criarRepositorio(concluida);
  repositorio.falharProximo();
  await assert.rejects(reabrir(repositorio, { id: 'a1', papel: 'admin' }, 't1'));
  assert.deepEqual(await repositorio.carregar(), concluida);
  assert.deepEqual(repositorio.eventos(), []);
});
