import {withPublicDependencies} from './public-test-source.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import test from 'node:test';
import {solutions} from './test-stage01-checks.mjs';
import {stage01Preparation} from '../course-src/stage01-preparation.mjs';
const root = new URL('../public/',import.meta.url);
const catalog=JSON.parse(readFileSync(new URL('course-catalog.json',root),'utf8'));
function fixture(id) {
  const dom=new JSDOM('<main id="view"></main>',{runScripts:'outside-only',url:'http://localhost'});
  dom.window.DevPathStage01Preparation=stage01Preparation;
  for(const name of ['runner','checks','ui']) dom.window.eval(withPublicDependencies(readFileSync(new URL(`stage01-${name}.js`,root),'utf8')));
  const ui=dom.window.DevPathStage01UI, item=catalog.find(x=>x.id===id), progress={};
  const ctx={progress,activities:catalog,saveProgress(){assert.doesNotThrow(()=>JSON.stringify(progress));},render(){view.innerHTML=ui.render(item,ctx);}};
  const view=dom.window.document.querySelector('#view'); ctx.render();
  const click=selector=>ui.handleClick({target:view.querySelector(selector),preventDefault(){}},item,ctx);
  const input=(selector,value)=>{const target=view.querySelector(selector);target.value=value;ui.handleInput({target},item,ctx);};
  return {dom,ui,item,ctx,view,progress,click,input};
}
test('completion read does not create or modify missing state',()=>{
  const f=fixture('01.01'), empty={};assert.equal(f.ui.complete(f.item,empty),false);assert.deepEqual(empty,{});f.dom.window.close();
});
test('restored completion flags cannot approve incorrect code',()=>{
  const f=fixture('01.07');try{const p=f.progress.stage01['01.07'];p.code='console.log("2h15");';p.passedCode=p.code;p.complete=true;p.predictions=['2h15'];p.predictionSaved=true;p.reflection='Uma explicação com dezesseis caracteres.';assert.equal(f.ui.complete(f.item,f.progress),false);}finally{f.dom.window.close();}
});
test('mastery transfers reject a copied second value without the requested reassignment',()=>{
  const f=fixture('01.09');try{for(const t of stage01Preparation['01.09'].masteryTransfers){const name=t.id==='config'?'duracao':'horas', value=t.id==='config'?'30':'6';const shortcut=t.solution.replace(new RegExp(`${name} = ${value};`),'').replaceAll(`\${${name}}`, `\${${name}}`);assert.equal(f.dom.window.DevPathStage01Checks.checkTransfer(t.id,shortcut).ok,false);}}finally{f.dom.window.close();}
});
test('01.09 transfer prompts expose the exact values their checks require',()=>{
  const f=fixture('01.09');try {
    const prompts=[...f.view.querySelectorAll('.s01-transfer > p')].map(node=>node.textContent);
    assert.match(prompts[0],/30/);
    assert.match(prompts[1],/6 horas/);
  } finally {f.dom.window.close();}
});
for(const id of Object.keys(solutions)) test(`${id}: real UI requires prediction, passing code, explanation and explicit completion`,()=>{
  const f=fixture(id);try {
    f.click('[data-stage01-action="run"]');assert.equal(f.progress.stage01[id].passedCode,null);
    f.input('[data-stage01-prediction="0"]','uma previsão');f.click('[data-stage01-action="save-predictions"]');
    if(stage01Preparation[id].predictionRows.length>1) assert.equal(f.progress.stage01[id].predictionSaved,false);
    const p=f.progress.stage01[id];p.code=solutions[id];
    if(id==='01.03'){p.order=['A','B','C','D'];p.secondOrder='C B A D';}
    for(let i=0;i<stage01Preparation[id].predictionRows.length;i++)f.input(`[data-stage01-prediction="${i}"]`,'Minha previsão antes da execução');
    f.click('[data-stage01-action="save-predictions"]');f.click('[data-stage01-action="run"]');
    assert.equal(p.passedCode,p.code, f.view.textContent);assert.equal(f.ui.complete(f.item,f.progress),false);
    f.input('[data-stage01-reflection]','Os valores mudam apenas quando ocorre uma reatribuição.');
    if(id==='01.09') {
      assert.equal(f.view.querySelector('[data-stage01-action="complete"]').disabled,true);
      for(const [i,t] of stage01Preparation[id].masteryTransfers.entries()) {
        f.input(`[data-stage01-transfer="${i}"]`,'O segundo resumo mostra a atualização de um único dado.');
        f.input(`[data-stage01-transfer-code="${i}"]`,t.solution);
        f.click(`[data-stage01-transfer-index="${i}"]`);
        assert.equal(p.transfers[i].passedCode,t.solution,f.view.textContent);
      }
    }
    assert.equal(f.ui.complete(f.item,f.progress),false,'ready is not completed');
    assert.equal(f.view.querySelector('[data-stage01-action="complete"]').disabled,false);
    f.click('[data-stage01-action="complete"]');assert.equal(f.ui.complete(f.item,f.progress),true);assert.equal(f.progress.answers[id],true);
    assert.doesNotThrow(()=>JSON.stringify(f.progress),'BigInt AST must not leak into saved progress');
    if(id==='01.09'){f.input('[data-stage01-transfer="0"]','Uma nova previsão');assert.equal(f.ui.complete(f.item,f.progress),false);}
    else {f.input('[data-stage01-reflection]','curto');assert.equal(f.ui.complete(f.item,f.progress),false);}
    assert(f.view.querySelector('.s01-navigation a[href="#/catalog"]'));
    assert.equal(f.view.querySelectorAll('.s01-result tbody tr').length,f.dom.window.DevPathStage01Checks.cases[id].cases.reduce((n,c)=>n+c.expected.length,0)+(id==='01.09'?4:0));
  } finally{f.dom.window.close();}
});
test('blank controls preserve identifiers, allow correction, synchronize editor and survive render',()=>{
  const f=fixture('01.04');try{
    f.input('[data-stage01-blank="0"]','let');assert.match(f.progress.stage01['01.04'].code,/let nome\b/);
    f.input('[data-stage01-blank="0"]','const');assert.match(f.view.querySelector('[data-stage01-editor]').value,/const nome\b/);
    f.ctx.render();assert.equal(f.view.querySelector('[data-stage01-blank="0"]').value,'const');
  }finally{f.dom.window.close();}
});
test('removing every Parsons block keeps empty code, rather than restoring starter',()=>{
  const f=fixture('01.03');try{while(f.view.querySelector('[data-stage01-action="remove"]')) f.click('[data-stage01-action="remove"]');assert.equal(f.progress.stage01['01.03'].code,'');assert.equal(f.view.querySelector('[data-stage01-editor]').value,'');}finally{f.dom.window.close();}
});

test('all six declaration controls complete the actual starter without extra code',()=>{
  const f=fixture('01.04');try{
    for(const [i,kind] of ['const','let','const','let','const','let'].entries()) f.input(`[data-stage01-blank="${i}"]`,kind);
    f.ctx.render();
    assert(!f.progress.stage01['01.04'].code.includes('___'));
    assert.equal(f.dom.window.DevPathStage01Checks.check('01.04',f.progress.stage01['01.04'].code).ok,true);
  }finally{f.dom.window.close();}
});

test('editing approved code removes old feedback and explains missing completion evidence',()=>{
  const f=fixture('01.07');try{
    f.input('[data-stage01-prediction="0"]','2h15');f.click('[data-stage01-action="save-predictions"]');
    f.input('[data-stage01-editor]',solutions['01.07']);f.click('[data-stage01-action="run"]');
    assert(f.view.querySelector('[data-stage01-result]'));
    f.input('[data-stage01-editor]','console.log("outra versão");');
    assert.equal(f.view.querySelector('[data-stage01-result]'),null);
    assert.match(f.view.querySelector('[data-stage01-status]').textContent,/execute novamente/i);
    assert.match(f.view.querySelector('[data-stage01-completion]').textContent,/Executar e conferir/);
    f.ctx.render();assert.equal(f.view.querySelector('[data-stage01-result]'),null);
  }finally{f.dom.window.close();}
});

test('save predictions restores focus to the run control after replacing the lesson',()=>{
  const f=fixture('01.07');try{
    f.input('[data-stage01-prediction="0"]','2h15');f.click('[data-stage01-action="save-predictions"]');
    assert.equal(f.dom.window.document.activeElement,f.view.querySelector('[data-stage01-action="run"]'));
  }finally{f.dom.window.close();}
});

test('declaration controls also update every declaration in a compact saved draft',()=>{
  const f=fixture('01.04');try{
    f.input('[data-stage01-editor]',f.progress.stage01['01.04'].code.replaceAll('\n',' '));
    for(const [i,kind] of ['const','let','const','let','const','let'].entries()) f.input(`[data-stage01-blank="${i}"]`,kind);
    f.ctx.render();
    assert.equal(f.dom.window.DevPathStage01Checks.check('01.04',f.progress.stage01['01.04'].code).ok,true);
    assert.deepEqual(Array.from(f.view.querySelectorAll('[data-stage01-blank]'),node=>node.value),['const','let','const','let','const','let']);
  }finally{f.dom.window.close();}
});

test('legacy 01.04 starter gains its missing log while preserving learner choices',()=>{
  const f=fixture('01.04');try{
    const p=f.progress.stage01['01.04'];
    p.code='const nome="Ana"; let pontos=0; pontos=5; const ativo=false; let volume=0; volume=7; const idioma="pt-BR"; let tentativas=1; tentativas=2;';
    f.ctx.render();
    assert.equal(f.dom.window.DevPathStage01Checks.check('01.04',p.code).ok,true);
    assert.match(p.code,/const nome/);
    const migrated=p.code;f.ctx.render();assert.equal(p.code,migrated);
    p.code='const nome="Meu rascunho";';f.ctx.render();assert.equal(p.code,'const nome="Meu rascunho";');
  }finally{f.dom.window.close();}
});
