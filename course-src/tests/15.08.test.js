import {test} from 'node:test'; import assert from 'node:assert/strict'; import {clamp,unique,paginar} from './paginacao.ts';
test('clamp respeita faixa e ordem',()=>{assert.equal(clamp(4,1,3),3);assert.equal(clamp(-1,0,3),0);assert.throws(()=>clamp(1,5,0),RangeError);});
test('unique preserva ordem e não muta',()=>{const input=[3,1,3,NaN,NaN];assert.deepEqual(unique(input),[3,1,NaN]);assert.deepEqual(input,[3,1,3,NaN,NaN]);});
test('paginar verifica fronteiras e devolve recorte',()=>{assert.deepEqual(paginar([1,2,3],2,2),[3]);for(const [page,size] of [[0,2],[1.2,2],[1,0]])assert.throws(()=>paginar([1],page,size),RangeError);});
