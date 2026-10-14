import {test} from "node:test"; import assert from "node:assert/strict"; import {format} from "./preco.ts";
test('null e números preservam zero',()=>{/*@case 16.02.null-e-numeros-preservam-zer-0c3204dd*/assert.equal(format(null),'—');/*@case 16.02.null-e-numeros-preservam-zer-71a0c6a3*/assert.equal(format(2),'2');/*@case 16.02.null-e-numeros-preservam-zer-5409d6d7*/assert.equal(format(0),'0');});
test('texto remove espaços das bordas',()=>/*@case 16.02.texto-remove-espacos-das-bor-b49325ef*/assert.equal(format(' a '),'a'));
test('vazio permanece texto vazio',()=>/*@case 16.02.vazio-permanece-texto-vazio-353e0a60*/assert.equal(format('  '),''));
