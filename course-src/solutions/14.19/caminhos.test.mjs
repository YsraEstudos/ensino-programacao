import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { arquivoDoModulo, arquivoPorUrl, pastaDoModulo } from './caminhos.mjs';

test('dirname e filename apontam para este arquivo, não para o diretório de execução', () => {
  assert.equal(arquivoDoModulo(), arquivoPorUrl());
  assert.equal(pastaDoModulo(), path.dirname(arquivoPorUrl()));
  assert.equal(path.basename(arquivoDoModulo()), 'caminhos.mjs');
});
