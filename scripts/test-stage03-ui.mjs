import test from 'node:test';
import assert from 'node:assert/strict';
import {setup,catalog,solutions,secondary,transfers} from './stage03-test-helpers.mjs';
test('the nine dedicated activities teach before prediction with labeled inputs',()=>{
  for(const item of catalog.filter(x=>x.stage==='03' && /^03\.0[1-9]$/.test(x.id))) {const {dom,q}=setup(item.id);try{assert(q('.s03-teaching'));assert(q('.s03-teaching').compareDocumentPosition(q('[data-s03-prediction]'))&4);assert.equal(q('[data-s03-action="run"]'),null);for(const el of dom.window.document.querySelectorAll('[data-s03-cell]'))assert(el.getAttribute('aria-label'));}finally{dom.window.close();}}
});
test('trace needs correct table and supplied code; edits invalidate completion',()=>{
  const {dom,w,item,ctx,q,click,fill,table,predict}=setup('03.01');try{
    predict();assert(q('[data-s03-code]').readOnly);click('run');assert.equal(ctx.progress.exerciseEvidence['03.01@v2'].status,undefined);table();click('run');assert.equal(ctx.progress.exerciseEvidence['03.01@v2'].status,'executed');fill('[data-s03-reflection]','O contador avança após o corpo e o acumulador conserva a soma.');dom.window.document.querySelectorAll('[data-s03-rubric]').forEach(el=>{el.checked=true;w.DevPathStage03UI.handleInput({target:el},item,ctx);});click('complete');assert(w.DevPathStage03UI.complete(item,ctx.progress));fill('[data-s03-cell="0"]','9');assert.equal(w.DevPathStage03UI.complete(item,ctx.progress),false);
  }finally{dom.window.close();}
});
test('typing code preserves focus and empty drafts survive reload within API limits',()=>{
  const {dom,w,ctx,q,fill,predict}=setup('03.07');try{predict();q('[data-s03-code]').focus();fill('[data-s03-code]',solutions['03.07']);assert.equal(w.document.activeElement,q('[data-s03-code]'));assert(ctx.progress.exerciseDrafts['03.07@v2'].length<=2500);ctx.render();assert.equal(q('[data-s03-code]').value,solutions['03.07']);fill('[data-s03-code]','');ctx.render();assert.equal(q('[data-s03-code]').value,'');}finally{dom.window.close();}
});
test('Parsons buttons retain focus and independent branches may swap',()=>{
  const {dom,w,item,ctx,predict,q,click}=setup('03.03');try{predict();const p=w.DevPathStage03Preparation['03.03'];assert.equal(w.DevPathStage03Checks.check('03.03',w.DevPathStage03UI.parsonsCode(p,p.parsons.initialOrder)).ok,false);for(let i=0;i<2;i++)w.DevPathStage03UI.handleClick({target:q('[data-s03-action="up"][data-block="both"]')},item,ctx);assert.equal(w.document.activeElement.dataset.block,'both');click('run');assert.equal(ctx.progress.exerciseEvidence['03.03@v2'].runResult,'result');assert.equal(w.DevPathStage03Checks.check('03.03',w.DevPathStage03UI.parsonsCode(p,['both','five','three','other'])).ok,true);}finally{dom.window.close();}
});
test('matrix validates booleans instead of accepting arbitrary prose',()=>{
  const {dom,ctx,click,table,predict}=setup('03.05');try{predict();click('run');assert.equal(ctx.progress.exerciseEvidence['03.05@v2'].status,undefined);table();click('run');assert.equal(ctx.progress.exerciseEvidence['03.05@v2'].status,'written');}finally{dom.window.close();}
});
test('code activities require fresh cases, minipractices and independent transfers',()=>{
  for(const id of ['03.04','03.06','03.07','03.08','03.09']) {const {dom,w,item,ctx,q,click,fill,table,predict}=setup(id);try{predict();table();fill('[data-s03-code]',solutions[id]);click('run');assert.equal(ctx.progress.exerciseEvidence[`${id}@v2`].runResult,'result',q('[data-s03-output]').textContent);if(secondary[id])fill('[data-s03-secondary]',secondary[id]);if(transfers[id]){fill('[data-s03-transfer]',transfers[id]);fill('[data-s03-transfer-prediction]','Estado previsto sem dicas.');click('transfer');assert.match(q('[data-s03-transfer-output]').textContent,/passaram/);}fill('[data-s03-reflection]','A condição, o estado e a ordem das ações justificam o resultado.');w.document.querySelectorAll('[data-s03-rubric]').forEach(el=>{el.checked=true;w.DevPathStage03UI.handleInput({target:el},item,ctx);});click('complete');assert(w.DevPathStage03UI.complete(item,ctx.progress),q('[data-s03-complete-status]')?.textContent);assert(ctx.progress.reviewSchedule[id]);assert(ctx.progress.exerciseDrafts[`${id}@v2`].length<=2500);}finally{dom.window.close();}}
});
test('missing switch and incorrect revised code block completion',()=>{
  const {dom,w,item,ctx,click,fill,table,predict,q}=setup('03.04');try{predict();table();fill('[data-s03-code]',solutions['03.04']);click('run');click('complete');assert(!w.DevPathStage03UI.complete(item,ctx.progress));assert.match(q('[data-s03-complete-status]').textContent,/miniprática/);fill('[data-s03-code]','console.log("A");');click('complete');assert(!w.DevPathStage03UI.complete(item,ctx.progress));}finally{dom.window.close();}
});
