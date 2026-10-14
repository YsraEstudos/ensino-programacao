import {test} from 'node:test'; import assert from 'node:assert/strict'; import {primeiro,buscarPorId} from './busca.ts';
test('primeiro preserva tipo e sinaliza array vazio',()=>{/*@case 17.04.primeiro-preserva-tipo-e-sin-e39da4ff*/assert.equal(primeiro([4,5]),4);/*@case 17.04.primeiro-preserva-tipo-e-sin-5bfc9855*/assert.equal(primeiro([]),undefined);});
test('buscarPorId devolve o item correspondente',()=>{const xs=[{id:'a',nome:'Ana'},{id:'b',nome:'Bia'}];/*@case 17.04.buscarporid-devolve-o-item-c-fe31701b*/assert.equal(buscarPorId(xs,'b'),xs[1]);});
test('buscarPorId sinaliza ausência',()=>/*@case 17.04.buscarporid-sinaliza-ausenci-9ccb79bd*/assert.equal(buscarPorId([{id:'a',nome:'Ana'}],'x'),undefined));
