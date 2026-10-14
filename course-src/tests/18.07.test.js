import {test} from 'node:test'; import assert from 'node:assert/strict'; import {nomeDe} from './usuarios.ts';
test('nomeDe retorna o nome existente',()=>/*@case 18.07.nomede-retorna-o-nome-existe-4af182ee*/assert.equal(nomeDe('u1'),'Ana'));
test('nomeDe lança RangeError para ID ausente',()=>/*@case 18.07.nomede-lanca-rangeerror-para-04fb3685*/assert.throws(()=>nomeDe('u9'),RangeError));
test('o erro de ausência identifica o ID',()=>/*@case 18.07.o-erro-de-ausencia-identific-a7541e08*/assert.throws(()=>nomeDe('u9'),/u9/));
