import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { diagnosticPreparation } from '../course-src/diagnostic-preparation.mjs';

const root = new URL('../public/', import.meta.url);
const catalog = JSON.parse(fs.readFileSync(new URL('course-catalog.json', root), 'utf8'));
function fixture(id) {
  const dom = new JSDOM('<main id="view"></main>', {runScripts:'outside-only',url:'http://localhost'});
  dom.window.HTMLElement.prototype.scrollIntoView = function () {};
  for (const file of ['js-diagnostic-preparation.js','js-diagnostic-ui.js']) dom.window.eval(fs.readFileSync(new URL(file,root),'utf8'));
  const item = catalog.find(item=>item.id===id), ui=dom.window.DevPathDiagnosticUI, progress={}, view=dom.window.document.querySelector('#view');
  const ctx = {progress,activities:catalog,saveProgress(){assert.doesNotThrow(()=>JSON.stringify(progress));},render(){view.innerHTML=ui.render(item,ctx);}};
  const click = selector => ui.handleClick({target:view.querySelector(selector),preventDefault(){}},item,ctx);
  const input = (selector,value) => {const target=view.querySelector(selector); if(target.type==='checkbox')target.checked=value;else target.value=value;ui.handleInput({target},item,ctx);};
  ctx.render(); return {dom,item,ui,progress,view,ctx,click,input};
}
for (const id of Object.keys(diagnosticPreparation)) test(`${id}: unknown answers get explained feedback and allow completion`,()=>{
  const f=fixture(id); try {
    assert(!f.view.querySelector('[data-course-editor], [data-course-run]'),'diagnosis does not ask learners to edit or execute code');
    assert.equal(f.view.querySelectorAll('[data-diagnostic-field]').length,diagnosticPreparation[id].fields.length);
    f.click('[data-diagnostic-action="check"]');
    assert.equal(f.progress.exerciseEvidence,undefined,'empty diagnosis must not produce reviewed evidence');
    f.click('[data-diagnostic-action="unknown"]');
    assert.equal(f.ui.readState(f.item,f.progress).confidence,0);
    f.click('[data-diagnostic-action="check"]');
    assert.equal(f.dom.window.document.activeElement.id,'diagnostic-review');
    assert(f.view.querySelector('[data-diagnostic-feedback]').textContent.includes('Tudo bem começar sem saber'));
    assert.equal(f.view.querySelector('[data-diagnostic-action="complete"]').disabled,true);
    f.input('[data-diagnostic-reviewed]',true);f.click('[data-diagnostic-action="complete"]');
    assert.equal(f.progress.answers[id],true,'correctness does not gate a diagnostic');
    assert.equal(f.progress.exerciseVersions[id],f.item.contentVersion||1);
    assert.equal(f.progress.attempts[id],1);
    assert(f.progress.reviewSchedule[id].dueAt>Date.now(),'completed diagnostics keep the existing review schedule');
    f.click('[data-diagnostic-action="complete"]');assert.equal(f.progress.attempts[id],1,'a repeated completion click is not another attempt');
    assert(f.progress.exercisePredictions[f.ui.key(f.item)].length<=400,'structured answers fit the existing account sanitizer');
    const restored=JSON.parse(JSON.stringify(f.progress));
    assert(f.ui.render(f.item,{...f.ctx,progress:restored}).includes('Diagnóstico registrado'));
    const field=diagnosticPreparation[id].fields[0];
    f.input('[data-diagnostic-field="0"]',field.expected);
    assert.equal(f.progress.answers[id],false,'editing a completed answer invalidates that attempt');
    assert.equal(f.view.querySelector('[data-diagnostic-finish]').hidden,true);
    assert(!f.view.querySelector('[data-diagnostic-feedback]').textContent.includes('Resposta explicada:'),'stale feedback must disappear');
  } finally {f.dom.window.close();}
});
test('confidence is bounded, and legacy response text is preserved until an explicit edit',()=>{
  const f=fixture('D.01');try {
    f.progress.exercisePredictions={D:'unrelated', [f.ui.key(f.item)]:'Minha previsão antiga: porta, 5, aberta'};
    f.ctx.render();assert(f.view.textContent.includes('Minha previsão antiga'));assert.equal(f.progress.exercisePredictions.D,'unrelated');
    f.click('[data-diagnostic-action="unknown"]');
    for(const value of ['-1','101','2.5','']) {f.input('[data-diagnostic-confidence]',value);f.click('[data-diagnostic-action="check"]');assert.equal(f.progress.exerciseEvidence,undefined);}
    f.input('[data-diagnostic-confidence]','100');f.click('[data-diagnostic-action="check"]');assert.equal(f.ui.readState(f.item,f.progress).confidence,100);
  }finally{f.dom.window.close();}
});
test('public diagnostic content matches the editorial source and every choice has beginner feedback',()=>{
  const f=fixture('D.02');try {
    assert.equal(JSON.stringify(f.dom.window.DevPathDiagnosticPreparation),JSON.stringify(diagnosticPreparation));
    for(const [id,config] of Object.entries(diagnosticPreparation))for(const field of config.fields){
      assert(field.options.some(x=>x.value==='unknown'));
      assert(field.options.some(x=>x.value===field.expected));
      assert(field.options.length>=3,'a diagnostic offers an alternative hypothesis alongside unknown');
      assert.equal(new Set(field.options.map(x=>x.value)).size,field.options.length);
      assert(field.explanation.trim());
      if(id!=='D.05')assert(field.options.every(x=>x.value==='unknown'||x.value===x.label),'literal response labels must match their stored values');
    }
    assert.equal(diagnosticPreparation['D.02'].fields.length,12,'each value has separate conceptual-type and typeof answers');
  }finally{f.dom.window.close();}
});
test('the actual D route loads its dedicated diagnostic and preserves Stage00 rendering',async()=>{
  const dom=new JSDOM(fs.readFileSync(new URL('devpath.html',root),'utf8'),{runScripts:'outside-only',url:'http://localhost/devpath.html#/javascript/D.01'});
  try {
    dom.window.fetch=async url=>({ok:true,json:async()=>url==='/course-catalog.json'?catalog:{progress:{}}});
    const scripts=[...dom.window.document.querySelectorAll('script[src]')].map(script=>script.getAttribute('src').split('?')[0].slice(1));
    for(const file of scripts)dom.window.eval(fs.readFileSync(new URL(file,root),'utf8'));
    for(let i=0;i<4;i++)await new Promise(resolve=>setImmediate(resolve));
    assert(dom.window.document.querySelector('.diagnostic-lesson.s00-lesson'));
    dom.window.location.hash='#/javascript/00.01';
    await new Promise(resolve=>setTimeout(resolve,30));
    assert(dom.window.document.querySelector('.s00-lesson:not(.diagnostic-lesson)'));
    assert(!dom.window.document.querySelector('.diagnostic-lesson'));
  }finally{dom.window.close();}
});
