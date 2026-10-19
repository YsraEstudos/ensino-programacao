import {test} from 'node:test'; import assert from 'node:assert/strict'; import {nomeEmCaixaAlta} from './perfil.ts';
test('lê e normaliza payload válido',()=>assert.equal(nomeEmCaixaAlta('{"name":"Ana"}'),'ANA'));
test('distingue JSON malformado',()=>assert.throws(()=>nomeEmCaixaAlta('{'),SyntaxError));
test('rejeita forma inválida antes do método',()=>{assert.throws(()=>nomeEmCaixaAlta('{"name":42}'),TypeError);assert.throws(()=>nomeEmCaixaAlta('{}'),TypeError);});
test('expõe mensagem de validação de forma inválida',()=>assert.throws(()=>nomeEmCaixaAlta('{"name":42}'),/Perfil inválido/));
