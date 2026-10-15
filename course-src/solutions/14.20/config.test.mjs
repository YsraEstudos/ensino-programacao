import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { carregarEnvArquivo, lerConfig } from './config.mjs';

test('lerConfig usa padrões quando o ambiente está vazio', () => {
  assert.deepEqual(lerConfig({}), { porta: 3000, modo: 'producao' });
});

test('lerConfig aceita valores explícitos e rejeita porta não numérica', () => {
  assert.deepEqual(lerConfig({ PORTA: '8080', MODO: 'dev' }), { porta: 8080, modo: 'dev' });
  assert.throws(() => lerConfig({ PORTA: 'abc' }), RangeError);
});

test('loadEnvFile preenche process.env e lerConfig lê o resultado', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'devpath-14-20-'));
  const arquivo = path.join(dir, 'app.env');
  writeFileSync(arquivo, 'PORTA=9000\nMODO=teste\n');
  const anterior = { PORTA: process.env.PORTA, MODO: process.env.MODO };
  // loadEnvFile não sobrescreve variáveis já definidas: limpe antes de carregar.
  delete process.env.PORTA;
  delete process.env.MODO;
  try {
    carregarEnvArquivo(arquivo);
    assert.deepEqual(lerConfig(process.env), { porta: 9000, modo: 'teste' });
  } finally {
    for (const [chave, valor] of Object.entries(anterior)) {
      if (valor === undefined) delete process.env[chave];
      else process.env[chave] = valor;
    }
    rmSync(dir, { recursive: true, force: true });
  }
});
