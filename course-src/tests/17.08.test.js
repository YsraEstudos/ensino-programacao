import {test} from "node:test"; import assert from "node:assert/strict"; import {Cache} from "./cache.ts";
test('expira exatamente no limite e remove entrada',()=>{let now=0;const c=new Cache(()=>now);c.set('a',1,100);now=99;assert.equal(c.get('a'),1);now=100;assert.equal(c.get('a'),undefined);assert.equal(c.has('a'),false);});
test('TTL inválido e valores falsy',()=>{const c=new Cache(()=>0);assert.throws(()=>c.set('bad',1,-1),RangeError);c.set('zero',0,20);c.set('undef',undefined,20);assert.equal(c.has('zero'),true);assert.equal(c.get('zero'),0);assert.equal(c.has('undef'),true);});
test('delete informa presença',()=>{const c=new Cache(()=>0);c.set(1,'x',5);assert.equal(c.delete(1),true);assert.equal(c.delete(1),false);});
