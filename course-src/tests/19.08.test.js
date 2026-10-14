import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Emitter} from '../emitter.ts';

test('evento envia somente o payload associado ao nome',()=>{
  const emitter=new Emitter();
  const received=[];
  emitter.on('priceChanged',payload=>received.push(payload));
  emitter.emit('priceChanged',{sku:'x',price:4});
  /*@case 19.08.evento-envia-somente-o-paylo-a0511b08*/assert.deepEqual(received,[{sku:'x',price:4}]);
});

test('off impede chamadas futuras e é idempotente',()=>{
  const emitter=new Emitter();
  let calls=0;
  const listener=()=>{calls++;};
  emitter.on('itemRemoved',listener);
  emitter.off('itemRemoved',listener);
  emitter.off('itemRemoved',listener);
  emitter.emit('itemRemoved',{sku:'x'});
  /*@case 19.08.off-impede-chamadas-futuras--2f3174e4*/assert.equal(calls,0);
});

test('listeners de eventos distintos permanecem isolados',()=>{
  const emitter=new Emitter();
  let added=0;
  let removed=0;
  emitter.on('itemAdded',()=>{added++;});
  emitter.on('itemRemoved',()=>{removed++;});
  emitter.emit('itemAdded',{sku:'x'});
  /*@case 19.08.listeners-de-eventos-distint-58059764*/assert.equal(added,1);
  /*@case 19.08.listeners-de-eventos-distint-49814ca6*/assert.equal(removed,0);
});
