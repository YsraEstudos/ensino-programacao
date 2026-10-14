import {test} from 'node:test'; import assert from 'node:assert/strict'; import {ler} from './perfil.ts';
test('lê o perfil válido',()=>/*@case 15.04.le-o-perfil-valido-42e642c6*/assert.equal(ler({user:{name:'Ana'}}),'ANA'));
test('rejeita cada fronteira sem acesso prematuro',()=>{for(const v of [null,{}, {user:null},{user:{}},{user:{name:42}}]) /*@case 15.04.rejeita-cada-fronteira-sem-a-fb434af8*/assert.throws(()=>ler(v),TypeError);});
test('aceita nomes em branco sem alterar o limite da função',()=>/*@case 15.04.aceita-nomes-em-branco-sem-a-5da3946e*/assert.equal(ler({user:{name:'bia'}}),'BIA'));
test('valida a string antes de chamar métodos',()=>/*@case 15.04.valida-a-string-antes-de-cha-d717418e*/assert.throws(()=>ler({user:{name:42}}),/Nome inválido/));
