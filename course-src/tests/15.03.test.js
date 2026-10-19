import {test} from 'node:test'; import assert from 'node:assert/strict'; import {criarUsuario} from './usuario.ts';
test('preserva API, normaliza nome e grava instante ISO atual',()=>{const before=Date.now();const user=criarUsuario(' Ana ',13);const after=Date.now();assert.equal(user.nome,'Ana');assert.equal(user.idade,13);assert.match(user.criadoEm,/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);const stamp=Date.parse(user.criadoEm);assert.ok(stamp>=before-1000&&stamp<=after+1000);});
test('rejeita idade abaixo do limite',()=>assert.throws(()=>criarUsuario('Ana',12),RangeError));
test('não altera a idade permitida',()=>assert.equal(criarUsuario('Bia',13).idade,13));
