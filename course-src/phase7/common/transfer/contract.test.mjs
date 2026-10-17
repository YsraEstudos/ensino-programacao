import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reserve} from './submission.mjs';
test('new reservation decrements stock without mutating the input set',()=>{const orders=new Set(['old']);const result=reserve(orders,8,'order-A',3);assert.deepEqual(result,{ok:true,stock:5});assert.deepEqual([...orders],['old']);});
test('duplicate, invalid, and insufficient cases fail without changing inputs',()=>{const orders=new Set(['order-A']);for(const [id,q,stock] of [['order-A',1,9],['new',0,9],['new',10,9]]){const result=reserve(orders,stock,id,q);assert.equal(result.ok,false);assert.deepEqual([...orders],['order-A']);}});
