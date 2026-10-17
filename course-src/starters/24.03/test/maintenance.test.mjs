import test from 'node:test';import assert from 'node:assert/strict';
import {selectVisible} from '../maintenance/visible.mjs';
test('F-33 change request preserves order, identity and original array; hides done only on request',()=>{
  const input=[{id:'z',title:'Zeta',status:'done'},{id:'a',title:'Alpha',status:'todo'}],snapshot=structuredClone(input);
  assert.deepEqual(selectVisible(input).map(t=>t.id),['a','z']);assert.deepEqual(input,snapshot);
  assert.deepEqual(selectVisible(input,{hideDone:true}).map(t=>t.id),['a']);assert.deepEqual(selectVisible([],{hideDone:true}),[]);
});
