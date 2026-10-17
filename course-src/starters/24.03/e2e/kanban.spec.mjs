import {test,expect} from '@playwright/test';
import assert from 'node:assert/strict';
function equivalent(actual,expected){try{assert.deepEqual(actual,expected);}catch(error){if(error.code==='ERR_ASSERTION')error.message='PHASE7_ASSERTION[ERR_ASSERTION] '+error.message;throw error;}}

test('review P2 round 2: slow detail revalidation preserves unsaved selection, control and focus before saving',async({page,request})=>{
  const created=await request.post(process.env.P7_URL+'/api/tasks',{data:{title:'Preservar rascunho P2'}});assert.equal(created.status(),201);const task=await created.json();
  await page.goto(process.env.P7_URL+'/#/');await expect(page.getByRole('status')).toHaveText('Tarefas atualizadas.');
  await page.getByLabel('Quadro',{exact:true}).selectOption('slow');await expect(page.getByRole('status')).toHaveText('Tarefas atualizadas.');
  const slowResponse=page.waitForResponse(response=>response.url().endsWith('/api/tasks?board=slow')&&response.request().method()==='GET');
  await page.getByRole('link',{name:task.title}).click();await expect(page.getByRole('status')).toHaveText('Atualizando tarefas do cache…');
  const select=page.getByLabel('Estado da tarefa');await select.focus();await select.selectOption('doing');
  await select.evaluate(control=>{window.draftControl=control;});
  await slowResponse;await expect(page.getByRole('status')).toHaveText('Tarefas atualizadas.');
  equivalent(await select.evaluate(control=>({value:control.value,focused:document.activeElement===control,sameControl:window.draftControl===control})),{value:'doing',focused:true,sameControl:true});
  const savedRefresh=page.waitForResponse(response=>response.url().includes('/api/tasks?board=')&&response.request().method()==='GET');
  await page.getByRole('button',{name:'Salvar estado'}).click();await savedRefresh;await expect(page.getByRole('status')).toHaveText('Tarefas atualizadas.');
  await expect(page.getByLabel('Estado da tarefa')).toHaveValue('doing');
  const tasks=await(await request.get(process.env.P7_URL+'/api/tasks')).json();equivalent(tasks.find(item=>item.id===task.id).status,'doing');
});

test('review P2: keyboard skip-link focuses main without changing the route or removing the board',async({page})=>{
  await page.goto(process.env.P7_URL+'/#/');await expect(page.getByRole('status')).toHaveText('Tarefas atualizadas.');
  const before=await page.locator('kanban-board a').count();
  await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Ir para tarefas'})).toBeFocused();
  await page.keyboard.press('Enter');await page.evaluate(()=>new Promise(requestAnimationFrame));
  equivalent(await page.evaluate(()=>({hash:location.hash,focused:document.activeElement?.id,hasBoard:!!document.querySelector('kanban-board')})),{hash:'#/',focused:'workspace',hasBoard:true});
  equivalent(await page.locator('kanban-board a').count(),before);
  await page.keyboard.press('Tab');await expect(page.getByLabel('Quadro',{exact:true})).toBeFocused();
});

test('review P2: link return and browser back/forward revalidate externally changed tasks',async({page,request})=>{
  const created=await request.post(process.env.P7_URL+'/api/tasks',{data:{title:'Revalidar navegação P2'}});assert.equal(created.status(),201);const task=await created.json();
  await page.goto(process.env.P7_URL+'/#/');await expect(page.getByRole('status')).toHaveText('Tarefas atualizadas.');
  await page.getByRole('link',{name:task.title}).click();await expect(page.getByRole('heading',{name:task.title})).toBeFocused();
  await page.route('**/api/tasks?board=all',async route=>{await new Promise(resolve=>setTimeout(resolve,500));await route.continue();});
  const change=async status=>{const response=await request.patch(process.env.P7_URL+'/api/tasks/'+task.id,{data:{status}});assert.equal(response.status(),200);};
  const revalidating=async()=>{await page.evaluate(()=>new Promise(requestAnimationFrame));equivalent(await page.getByRole('status').innerText(),'Atualizando tarefas do cache…');await expect(page.getByRole('status')).toHaveText('Tarefas atualizadas.');};
  await change('doing');await page.getByRole('link',{name:'Voltar ao quadro'}).click();await revalidating();
  await expect(page.getByRole('region',{name:'Em andamento'}).getByRole('link',{name:task.title})).toBeVisible();
  await page.getByRole('link',{name:task.title}).click();await revalidating();await expect(page.getByLabel('Estado da tarefa')).toHaveValue('doing');
  await change('done');await page.goBack();await revalidating();
  await expect(page.getByRole('region',{name:'Concluído'}).getByRole('link',{name:task.title})).toBeVisible();
  await change('todo');await page.goForward();await revalidating();await expect(page.getByLabel('Estado da tarefa')).toHaveValue('todo');
});

test('review P2: blocked IndexedDB displays recoverable guidance in the UI and recovers after closing the other tab',async({page,context})=>{
  const blocker=await context.newPage();
  try{
    await blocker.goto(process.env.P7_URL+'/health');
    await blocker.evaluate(async()=>{window.heldDatabase=await new Promise((resolve,reject)=>{const request=indexedDB.open('devpath-kanban',1);request.onupgradeneeded=()=>request.result.createObjectStore('cards',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});});
    await page.goto(process.env.P7_URL+'/#/');await expect(page.getByRole('status')).toHaveText('Tarefas atualizadas.');
    equivalent(await page.getByRole('alert').innerText(),'Feche outra aba do quadro e tente novamente.');
    await blocker.evaluate(()=>window.heldDatabase.close());await blocker.close();
    await page.reload();await expect(page.getByRole('status')).toHaveText('Tarefas atualizadas.');equivalent(await page.getByRole('alert').innerText(),'');
    equivalent(await page.evaluate(()=>new Promise((resolve,reject)=>{const request=indexedDB.open('devpath-kanban',2);request.onsuccess=()=>{const version=request.result.version;request.result.close();resolve(version);};request.onerror=()=>reject(request.error);})),2);
  }finally{await blocker.close();}
});
test('real UI flow: keyboard list/detail, mutation, retry, empty, race, offline, DOM safety and mobile',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(process.env.P7_URL+'/#/');await expect(page.getByRole('status')).toHaveText('Tarefas atualizadas.');
  await page.getByRole('link',{name:'Preparar revisão acessível'}).focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/#\/tasks\/t1$/);
  await expect(page.getByRole('heading',{name:'Preparar revisão acessível'})).toBeFocused();
  await page.getByLabel('Estado da tarefa').selectOption('done');await page.getByRole('button',{name:'Salvar estado'}).click();await expect(page.getByLabel('Estado da tarefa')).toHaveValue('done');
  await page.getByRole('link',{name:'Voltar ao quadro'}).click();await expect(page.getByRole('region',{name:'Concluído'}).getByRole('link',{name:'Preparar revisão acessível'})).toBeVisible();
  await page.goBack();await expect(page.getByRole('heading',{name:'Preparar revisão acessível'})).toBeVisible();await page.goForward();
  const hostile='<img src=x onerror=window.pwned=1>';
  await page.getByLabel('Nova tarefa').fill(hostile);await page.getByRole('button',{name:'Adicionar tarefa'}).click();await expect(page.getByRole('link',{name:hostile})).toBeVisible();assert.equal(await page.evaluate(()=>window.pwned),undefined);
  await page.getByLabel('Quadro',{exact:true}).selectOption('error');await expect(page.getByRole('alert')).toContainText('Não foi possível atualizar');
  await page.getByLabel('Quadro',{exact:true}).selectOption('slow');await expect(page.getByRole('status')).toContainText('Carregando');
  await page.getByLabel('Quadro',{exact:true}).selectOption('empty');await expect(page.getByRole('status')).toHaveText('Nenhuma tarefa neste quadro.');
  await page.waitForTimeout(800);assert.equal(await page.locator('kanban-board a').count(),0,'out of order slow response must not replace empty board');
  await page.getByLabel('Quadro',{exact:true}).selectOption('all');await expect(page.getByRole('link',{name:hostile})).toBeVisible();
  await page.setViewportSize({width:375,height:812});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.getByLabel('Nova tarefa').focus();await expect(page.getByLabel('Nova tarefa')).toBeFocused();
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));});
  await page.context().setOffline(true);await page.getByRole('button',{name:'Atualizar',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Não foi possível atualizar');await expect(page.getByRole('link',{name:hostile})).toBeVisible();
  await page.reload();await expect(page.getByRole('link',{name:hostile})).toBeVisible();await expect(page.getByRole('alert')).toContainText('Não foi possível atualizar');
  await page.context().setOffline(false);await page.getByRole('button',{name:'Atualizar',exact:true}).click();await expect(page.getByRole('status')).toHaveText('Tarefas atualizadas.');
  assert.deepEqual(errors,[]);
});
test('IndexedDB v1 to v2 migration survives reopen; upgrade regression / incident I-F32',async({page})=>{
  await page.goto(process.env.P7_URL+'/health');
  await page.evaluate(async()=>{
    await new Promise((resolve,reject)=>{const remove=indexedDB.deleteDatabase('devpath-kanban');remove.onsuccess=resolve;remove.onerror=()=>reject(remove.error);});
    const db=await new Promise((resolve,reject)=>{const request=indexedDB.open('devpath-kanban',1);request.onupgradeneeded=()=>request.result.createObjectStore('cards',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
    await new Promise((resolve,reject)=>{const tx=db.transaction('cards','readwrite');tx.objectStore('cards').put({id:'legacy',title:'Preservar dados antigos',completed:true,updatedAt:7});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();
  });
  const migrated=await page.evaluate(async()=>{const {openDatabase,readTasks}=await import('/dist/storage.mjs');const db=await openDatabase();const result={version:db.version,tasks:await readTasks(db)};db.close();return result;});
  equivalent(migrated,{version:2,tasks:[{id:'legacy',title:'Preservar dados antigos',status:'done',updatedAt:7}]});
  const reopened=await page.evaluate(async()=>{const {openDatabase,readTasks,writeTasks}=await import('/dist/storage.mjs');const db=await openDatabase();const tasks=await readTasks(db);await writeTasks(db,[...tasks,{id:'added',title:'Persistida',status:'todo',updatedAt:8}]);db.close();const again=await openDatabase();const value=await readTasks(again);again.close();return value;});
  assert.equal(reopened.length,2);assert.equal(reopened.find(t=>t.id==='legacy').title,'Preservar dados antigos');
  const atomic=await page.evaluate(async()=>{const {openDatabase,readTasks,writeTasks}=await import('/dist/storage.mjs');const db=await openDatabase();let rejected=false;try{await writeTasks(db,[{title:'missing key'}]);}catch{rejected=true;}const tasks=await readTasks(db);db.close();return {rejected,count:tasks.length};});
  equivalent(atomic,{rejected:true,count:2});
  const blocked=await page.evaluate(async()=>{
    const old=await new Promise((resolve,reject)=>{const request=indexedDB.open('blocked-case',1);request.onupgradeneeded=()=>request.result.createObjectStore('cards',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
    const {openDatabase}=await import('/dist/storage.mjs');let message='';try{await openDatabase('blocked-case');}catch(error){message=error.message;}old.close();
    await new Promise(resolve=>setTimeout(resolve,50));
    const version=await new Promise((resolve,reject)=>{const request=indexedDB.open('blocked-case',3);request.onblocked=()=>reject(new Error('Leaked upgrade connection'));request.onerror=()=>reject(request.error);request.onsuccess=()=>{const value=request.result.version;request.result.close();resolve(value);};});
    return {recoverable:message.includes('Feche outra aba'),version};
  });
  equivalent(blocked,{recoverable:true,version:3});
});
test('Web Vitals are measured from browser performance entries; controlled lab interaction',async({page,context})=>{
  await page.goto(process.env.P7_URL+'/#/');await expect(page.getByRole('status')).toHaveText('Tarefas atualizadas.');
  // Controlled slow interaction produces a measurable Event Timing entry, not a fabricated metric.
  await page.evaluate(()=>document.querySelector('#refresh').addEventListener('click',()=>{const start=performance.now();while(performance.now()-start<80){};},{once:true}));
  await page.getByRole('button',{name:'Atualizar',exact:true}).click();await page.waitForTimeout(1500);
  const other=await context.newPage();await other.goto('about:blank');await other.bringToFront();await page.waitForTimeout(300);
  const metrics=await page.locator('[data-metric]').evaluateAll(items=>Object.fromEntries(items.map(item=>[item.dataset.metric,Number(item.dataset.value)])));
  for(const name of ['LCP','CLS','INP']){assert.equal(Number.isFinite(metrics[name]),true,`${name} must have real observer output`);assert.ok(metrics[name]>=0);}
  console.log('Browser Web Vitals laboratory sample:',JSON.stringify(metrics));await other.close();
});
