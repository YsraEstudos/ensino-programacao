import test from 'node:test';
import assert from 'node:assert/strict';
import {rotulo} from '../src/index.ts';
test('TypeScript apagável roda no Node e mantém o contrato', () => assert.equal(rotulo(' DevPath '), 'DevPath'));
