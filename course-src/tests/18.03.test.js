import {test} from 'node:test'; import assert from 'node:assert/strict'; import {get} from './acesso.ts';
test('get devolve valores numéricos',()=>/*@case 18.03.get-devolve-valores-numerico-9ebf1a4e*/assert.equal(get({id:7},'id'),7));
test('get devolve valores textuais',()=>/*@case 18.03.get-devolve-valores-textuais-0d5fbe08*/assert.equal(get({nome:'Ana'},'nome'),'Ana'));
test('get conserva undefined em propriedade ausente',()=>/*@case 18.03.get-conserva-undefined-em-pr-722bbcda*/assert.equal(get({nome:'Ana'},'id'),undefined));
