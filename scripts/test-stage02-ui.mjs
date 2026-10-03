import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {JSDOM} from 'jsdom';
import {solutions} from './test-stage02.mjs';
const root=new URL('../public/',import.meta.url);
const catalog=JSON.parse(readFileSync(new URL('course-catalog.json',root),'utf8'));
const settle=async()=>{for(let i=0;i<3;i++)await new Promise(resolve=>setImmediate(resolve));};
async function load(saved){
  const dom=new JSDOM(readFileSync(new URL('devpath.html',root),'utf8'),{url:'http://localhost:8000/devpath.html',runScripts:'outside-only'});
  let accountRequests=0;
  dom.window.fetch=async url=>{if(url==='/course-catalog.json')return {ok:true,json:async()=>catalog};accountRequests++;throw Error('Account API should not run in local preview');};
  if(saved)dom.window.localStorage.setItem('devpath-local-preview-v1',saved);
  for(const name of ['js-stage00-runner.js','js-stage00-ui.js','js-stage02-runner.js','js-stage02-lessons.js','js-stage02-ui.js','app.js'])dom.window.eval(readFileSync(new URL(name,root),'utf8'));
  await settle();
  const document=dom.window.document;
  const q=selector=>document.querySelector(selector);
  const click=action=>{const button=q(`[data-s02-action="${action}"]`);assert(button,`Missing button ${action}`);button.click();};
  const fill=(selector,value)=>{const node=q(selector);assert(node,`Missing input ${selector}`);node.value=value;node.dispatchEvent(new dom.window.Event('input',{bubbles:true}));};
  return {dom,q,click,fill,accountRequests:()=>accountRequests};
}
const multi=new Set(['02.01','02.10','02.11']);
for(const [id,blocks] of Object.entries(solutions))test(`${id}: full UI flow gates, execution, completion and reload`,async()=>{
  const {dom,q,click,fill,accountRequests}=await load();
  try{
    dom.window.location.hash=`#/javascript/${id}`;await settle();
    assert(q('[data-s02-action="complete"]').disabled);
    for(const [index,source] of blocks.entries()){
      assert(!q('[data-s02-code]'),'Editor must not open before prediction and understanding');
      if(index===0 && multi.has(id))assert(q('[data-s02-index="1"]').disabled,'Next block must start locked');
      const config=dom.window.DevPathStage02Lessons.lessons[id][index];
      if(config.rows){const predictions=config.cases.flatMap(entry=>entry.expected);config.rows.forEach((_,i)=>{fill(`[data-s02-row="${i}"]`,dom.window.DevPathStage02Runner.format(predictions[i]));fill(`[data-s02-type="${i}"]`,typeof predictions[i]);if(config.classifications && i%2===0){fill(`[data-s02-falsy="${i}"]`,'sim');fill(`[data-s02-nullish="${i}"]`,i===6||i===8?'sim':'não');}});}
      else fill('[data-s02-prediction]','Prevejo as saídas e a validade para cada entrada publicada.');
      click('predict');
      const answer=multi.has(id)?0:catalog.find(item=>item.id===id).review.answer;
      q(`input[name="s02-understanding"][value="${(answer+1)%3}"]`).checked=true;
      click('understand');assert(!q('[data-s02-code]'),'Incorrect understanding must not unlock code');
      q(`input[name="s02-understanding"][value="${answer}"]`).checked=true;click('understand');
      assert(q('[data-s02-code]'));
      click('run');assert(q('[data-s02-action="complete"]').disabled,'Unchanged starter cannot complete');
      if(config.faded){fill('[data-s02-gap="numero"]','Number(texto)');fill('[data-s02-gap="invalido"]','vazio || !Number.isFinite(numero)');}
      else if(config.parsons){
        q('[data-s02-action="up"][data-s02-position="2"]').click();q('[data-s02-action="up"][data-s02-position="1"]').click();q('[data-s02-action="remove"][data-s02-position="3"]').click();q('[data-s02-action="up"][data-s02-position="3"]').click();q('[data-s02-action="up"][data-s02-position="2"]').click();click('assemble');}
      else fill('[data-s02-code]',source);
      click('run');
      assert.match(q('[data-s02-results]').textContent,/Todos os casos passaram/);
      if(id==='02.02')assert.match(q('[data-s02-results]').textContent,/"" \(string\)/);
      if(id==='02.04')assert.match(q('[data-s02-results]').textContent,/Infinity/);
      if(id==='02.10' && index===2){click('random');assert.match(q('[data-s02-single-output]').textContent,/Linha/);}
      if(index<blocks.length-1)click('next');
    }
    fill('[data-s02-reflection]','Expliquei a regra, comparei as entradas e conferi as bordas publicadas.');
    assert(!q('[data-s02-action="complete"]').disabled);
    click('complete');assert.match(q('[data-s02-action="complete"]').textContent,/concluída/);
    assert.equal(accountRequests(),0);
    const saved=dom.window.localStorage.getItem('devpath-local-preview-v1');
    assert(saved);assert(JSON.parse(saved).reviewSchedule[id].dueAt>Date.now());
    const reloaded=await load(saved);
    reloaded.dom.window.location.hash=`#/javascript/${id}`;await settle();
    assert.match(reloaded.q('[data-s02-action="complete"]').textContent,/concluída/);
    if(id==='02.04')assert.match(reloaded.q('[data-s02-code]').value,/Number\(texto\)/);
    else if(id==='02.03')assert.match(reloaded.q('[data-s02-code]').value,/const podePagar = suficiente && autorizada/);
    else assert.equal(reloaded.q('[data-s02-code]').value,blocks.at(-1));
    reloaded.dom.window.location.hash='#/review';await settle();
    assert.match(reloaded.q('.review-question').textContent,new RegExp(id.replace('.','\\.')));
    reloaded.dom.window.close();
  }finally{dom.window.close();}
});

test('Parsons controls support reordering, removal and assembly without dragging',async()=>{
  const {dom,q,click,fill}=await load();
  try{
    dom.window.location.hash='#/javascript/02.03';await settle();
    fill('[data-s02-prediction]','Ambas as condições precisam ser verdadeiras.');click('predict');
    q(`input[name="s02-understanding"][value="${catalog.find(item=>item.id==='02.03').review.answer}"]`).checked=true;click('understand');
    // C,D,A,E,B -> A,B,C,D, using only the exposed controls.
    q('[data-s02-action="up"][data-s02-position="2"]').click();
    q('[data-s02-action="up"][data-s02-position="1"]').click();
    q('[data-s02-action="remove"][data-s02-position="3"]').click();
    q('[data-s02-action="up"][data-s02-position="3"]').click();
    q('[data-s02-action="up"][data-s02-position="2"]').click();
    click('assemble');click('run');
    assert.match(q('[data-s02-results]').textContent,/Todos os casos passaram/);
  }finally{dom.window.close();}
});

test('editing checked code invalidates completion; stale next button must be disabled',async()=>{
  const {dom,q,click,fill}=await load();
  try{
    dom.window.location.hash='#/javascript/02.01';await settle();
    for(let i=0;i<6;i++){fill(`[data-s02-row="${i}"]`,'0');fill(`[data-s02-type="${i}"]`,'number');}click('predict');
    q('input[name="s02-understanding"][value="0"]').checked=true;click('understand');
    fill('[data-s02-code]',solutions['02.01'][0]);click('run');
    fill('[data-s02-code]',solutions['02.01'][0]+'console.log(0);');
    assert(q('[data-s02-action="complete"]').disabled);
    assert(q('[data-s02-action="next"]').disabled);
  }finally{dom.window.close();}
});
