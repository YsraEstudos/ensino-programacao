import {test} from 'node:test'; import assert from 'node:assert/strict'; import {ler} from './perfil.ts';
test('lê o perfil válido',()=>assert.equal(ler({user:{name:'Ana'}}),'ANA'));
test('rejeita cada fronteira sem acesso prematuro',()=>{for(const v of [null,{}, {user:null},{user:{}},{user:{name:42}}]) assert.throws(()=>ler(v),TypeError);});
test('aceita nomes em branco sem alterar o limite da função',()=>assert.equal(ler({user:{name:'bia'}}),'BIA'));
test('valida a string antes de chamar métodos',()=>assert.throws(()=>ler({user:{name:42}}),/Nome inválido/));
