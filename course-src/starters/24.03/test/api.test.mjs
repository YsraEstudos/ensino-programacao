import test from 'node:test';
import assert from 'node:assert/strict';
import {createFixtureServer} from '../server.mjs';
test('real API fixture contract: list, create, patch, invalid input, origin, error and empty',async()=>{
  const server=createFixtureServer();await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const base=`http://127.0.0.1:${server.address().port}`;
  const send=(url,body,method='POST')=>fetch(base+url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  try{
    const original=await (await fetch(base+'/api/tasks')).json();assert.equal(original.length,2);
    assert.deepEqual(await(await fetch(base+'/api/tasks?board=empty')).json(),[]);assert.equal((await fetch(base+'/api/tasks?board=error')).status,503);
    assert.equal((await send('/api/tasks',{title:''})).status,400);assert.equal((await fetch(base+'/api/tasks',{headers:{Origin:'https://foreign.invalid'}})).status,403);
    const created=await send('/api/tasks',{title:'<script>sentinel</script>'});assert.equal(created.status,201);const task=await created.json();assert.equal(task.title,'<script>sentinel</script>');
    assert.equal((await send('/api/tasks/'+task.id,{status:'broken'},'PATCH')).status,400);assert.equal((await send('/api/tasks/'+task.id,{status:'done'},'PATCH')).status,200);
    assert.equal((await(await fetch(base+'/api/tasks')).json()).find(t=>t.id===task.id).status,'done');
    assert.equal((await send('/api/tasks/missing',{status:'done'},'PATCH')).status,404);
  }finally{await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});}
});
