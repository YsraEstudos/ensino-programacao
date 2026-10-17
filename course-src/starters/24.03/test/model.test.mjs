import test from 'node:test';
import assert from 'node:assert/strict';
import {createModel,validateTasks,route} from '../src/model.mjs';
const task=(id='t1')=>({id,title:'Texto '+id,status:'todo',updatedAt:1});
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
test('route contract accepts list and encoded detail, rejects malformed route',()=>{
  assert.deepEqual(route('#/'),{name:'list'});assert.deepEqual(route('#/tasks/a%20b'),{name:'detail',id:'a b'});
  assert.deepEqual(route('#/unknown'),{name:'not-found'});assert.deepEqual(route('#/tasks/%ZZ'),{name:'not-found'});
});
test('JSON contract rejects malformed task lists and copies hostile strings as text',()=>{
  for(const value of [null,{},[{}],[{...task(),status:'unknown'}],[{...task(),updatedAt:NaN}],[task(),task()]])assert.throws(()=>validateTasks(value),TypeError);
  const hostile={...task(),title:'<img src=x onerror=alert(1)>'};assert.equal(validateTasks([hostile])[0].title,hostile.title);
});
test('loading / empty / error / retry and valid response are observable',async()=>{
  let fail=false,value=[],events=[];const model=createModel({request:async()=>{if(fail)throw new Error('sentinel');return value;},changed:s=>events.push(s.status)});
  await model.load();assert.deepEqual(events,['loading','empty']);fail=true;await model.load();assert.equal(model.state.status,'error');assert.doesNotMatch(model.state.error,/sentinel/);
  fail=false;value=[task()];await model.load();assert.equal(model.state.status,'ready');assert.equal(model.state.tasks.length,1);
});
test('cache is visible while revalidating; stale snapshot survives network failure without cross-board leakage',async()=>{
  let calls=0;const model=createModel({request:async()=>{if(++calls>1)throw new Error('offline');return [task()];}});
  await model.load('all');const pending=model.load('all');assert.equal(model.state.status,'revalidating');assert.equal(model.state.source,'cache');assert.equal(model.state.tasks.length,1);await pending;assert.equal(model.state.status,'error');assert.equal(model.state.tasks.length,1);
  await model.load('other');assert.equal(model.state.tasks.length,0);
});
test('latest request wins for old success and old failure, including revisiting same key',async()=>{
  const old=deferred(),recent=deferred(),last=deferred();let index=0;
  const model=createModel({request:()=>[old,recent,last][index++].promise});
  const a=model.load('all'),b=model.load('empty');recent.resolve([]);await b;old.resolve([task()]);await a;assert.equal(model.state.board,'empty');assert.equal(model.state.status,'empty');assert.deepEqual(model.state.tasks,[]);
  const c=model.load('all');last.reject(new Error('offline'));await c;assert.equal(model.state.status,'error');
  const one=deferred(),two=deferred();index=0;const same=createModel({request:()=>[one,two][index++].promise});const x=same.load('all'),y=same.load('all');two.resolve([task('new')]);await y;one.reject(new Error('old failure'));await x;assert.equal(same.state.tasks[0].id,'new');assert.equal(same.state.status,'ready');
});
test('initial persisted tasks revalidate, snapshots cannot mutate the cache and invalidation works',async()=>{
  const wait=deferred();const model=createModel({initialTasks:[task('persisted')],request:()=>wait.promise});const loaded=model.load();assert.equal(model.state.source,'cache');assert.equal(model.state.tasks[0].id,'persisted');wait.resolve([task()]);await loaded;
  model.state.tasks[0].title='mutated';const fresh=model.load();assert.equal(model.state.tasks[0].title,'Texto t1');await fresh;model.invalidate();const next=model.load();assert.equal(model.state.source,'network');await next;
});
