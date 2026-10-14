import {test} from 'node:test'; import assert from 'node:assert/strict'; import {nomeEmCaixaAlta} from './perfil.ts';
test('lê e normaliza payload válido',()=>/*@case 15.11.le-e-normaliza-payload-valid-e4df04ac*/assert.equal(nomeEmCaixaAlta('{"name":"Ana"}'),'ANA'));
test('distingue JSON malformado',()=>/*@case 15.11.distingue-json-malformado-41c4c1ef*/assert.throws(()=>nomeEmCaixaAlta('{'),SyntaxError));
test('rejeita forma inválida antes do método',()=>{/*@case 15.11.rejeita-forma-invalida-antes-c66bfd10*/assert.throws(()=>nomeEmCaixaAlta('{"name":42}'),TypeError);/*@case 15.11.rejeita-forma-invalida-antes-d3a4ac04*/assert.throws(()=>nomeEmCaixaAlta('{}'),TypeError);});
test('expõe mensagem de validação de forma inválida',()=>/*@case 15.11.expoe-mensagem-de-validacao--79db4fdd*/assert.throws(()=>nomeEmCaixaAlta('{"name":42}'),/Perfil inválido/));
