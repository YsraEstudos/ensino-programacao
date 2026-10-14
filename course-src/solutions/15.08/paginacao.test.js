import { test } from 'node:test'; import assert from 'node:assert/strict'; import {clamp,unique,paginar} from './paginacao.js';
test('migração preserva exports e limites',()=>{assert.equal(clamp(4,1,3),3);assert.deepEqual(unique([1,1,2]),[1,2]);assert.deepEqual(paginar([1,2,3],2,2),[3]);assert.throws(()=>clamp(1,5,0),RangeError);assert.throws(()=>paginar([1],1.2,2),RangeError);});
