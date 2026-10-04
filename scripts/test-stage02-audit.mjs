import {withPublicDependencies} from './public-test-source.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import test from 'node:test';
const root=new URL('../public/',import.meta.url);
const catalog=JSON.parse(readFileSync(new URL('course-catalog.json',root)));
function setup(id){
  const dom=new JSDOM('<main id="view"></main>',{runScripts:'outside-only'});
  for(const file of ['runner','lessons','ui'])dom.window.eval(withPublicDependencies(readFileSync(new URL(`js-stage02-${file}.js`,root),'utf8')));
  const item=catalog.find(item=>item.id===id),progress={};
  const ctx={progress,saveProgress(){},scheduleSave(){},toast(){},render(){dom.window.document.querySelector('#view').innerHTML=dom.window.DevPathStage02UI.render(item,ctx);}};
  ctx.render();
  const q=selector=>dom.window.document.querySelector(selector);
  const click=action=>dom.window.DevPathStage02UI.handleClick({target:q(`[data-s02-action="${action}"]`)},item,ctx);
  return {dom,item,ctx,q,click,lessons:dom.window.DevPathStage02Lessons};
}
test('every Stage 02 block teaches with executable examples before the first prediction',()=>{
  for(const item of catalog.filter(item=>item.stage==='02')){
    const {dom,ctx,q,lessons}=setup(item.id);
    try{for(let i=0;i<lessons.lessons[item.id].length;i++){
      const state=dom.window.DevPathStage02UI.getState(item,ctx.progress);state.index=i;ctx.render();
      assert(q('[data-s02-teaching]'),`${item.id}/${i}: teaching is visible initially`);
      const code=q('[data-s02-example-code]');assert(code,`${item.id}/${i}: worked code exists`);
      assert.equal(dom.window.DevPathStage02Runner.run(code.textContent).ok,true,code.textContent);
      assert(q('[data-s02-teaching]').compareDocumentPosition(q('[data-s02-row], [data-s02-prediction]'))&4);
    }}finally{dom.window.close();}
  }
});
test('Number/Math bridge renders despite generated heading prefix',()=>{
  const {dom,q}=setup('02.10');try{assert.match(q('.s02-bridge')?.textContent||'',/Number, Math e tolerância/);}finally{dom.window.close();}
});
test('debug starter can be observed before predicting, without passing or completing',()=>{
  const {dom,q,click,ctx,item}=setup('02.06');try{
    assert(q('[data-s02-action="reproduce"]'));click('reproduce');
    assert.match(q('[data-s02-original-output]').textContent,/50/);
    const block=dom.window.DevPathStage02UI.getState(item,ctx.progress).blocks[0];
    assert.equal(block.predictionSaved,false);assert.equal(block.passedCode,null);
    assert.equal(dom.window.DevPathStage02UI.complete(item,ctx.progress),false);
  }finally{dom.window.close();}
});
test('payment boundary: balance equal to cost must be sufficient',()=>{
  const {dom,lessons}=setup('02.03');try{
    const wrong='const saldo=10;const valor=8;const ativa=true;console.log(saldo>valor && ativa===true);';
    assert.equal(lessons.check('02.03',0,wrong).ok,false);
  }finally{dom.window.close();}
});
test('preferences must preserve ordinary and mixed present values',()=>{
  const {dom,lessons}=setup('02.08');try{
    const wrong='const volumeEntrada=0;const temaEntrada="";const notificacoesEntrada=false;const volume=volumeEntrada??50;const tema=(temaEntrada??"claro")&&"claro";const notificacoes=notificacoesEntrada??true;console.log(volume,tema,notificacoes);';
    assert.equal(lessons.check('02.08',0,wrong).ok,false);
  }finally{dom.window.close();}
});
test('tolerance variable must follow each fixture resolution, not a constant',()=>{
  const {dom,lessons}=setup('02.12');try{
    const wrong='const a=2000.3;const b=2000.304;const resolucao=0.01;const tolerancia=0.005;console.log(resolucao/2,Math.abs(a-b)<=resolucao/2);';
    assert.equal(lessons.check('02.12',0,wrong).ok,false);
  }finally{dom.window.close();}
});
test('running focuses the results; opening hints focuses the newly opened hint',()=>{
  const {dom,q,ctx,item,click}=setup('02.07');try{
    const block=dom.window.DevPathStage02UI.getState(item,ctx.progress).blocks[0];
    block.predictionSaved=true;block.understood=true;block.code='const preco=100;const taxa=0.2;console.log(preco*(1-taxa));';ctx.render();
    click('run');assert.equal(dom.window.document.activeElement,q('[data-s02-results]'));
    assert.equal(q('[data-s02-results]').getAttribute('aria-live'),null);
    assert.equal(q('.s02-result-message').getAttribute('role'),'status');
    click('hint');assert.equal(dom.window.document.activeElement,q('[data-s02-hint="0"]'));
  }finally{dom.window.close();}
});
test('reload reopens incomplete saved predictions while preserving the draft',()=>{
  for(const id of ['02.01','02.02']){
    const {dom,item,ctx,lessons}=setup(id);try{
      const state=dom.window.DevPathStage02UI.getState(item,ctx.progress),block=state.blocks[0];
      block.code='// Meu rascunho permanece';
      block.prediction=JSON.stringify(lessons.lessons[id][0].rows.map(()=>({value:id==='02.01'?'':'0',type:'number'})));
      block.predictionSaved=true;block.understood=true;
      const restored=dom.window.DevPathStage02UI.getState(item,ctx.progress).blocks[0];
      assert.equal(restored.predictionSaved,false);assert.equal(restored.understood,false);
      assert.equal(restored.code,'// Meu rascunho permanece');
    }finally{dom.window.close();}
  }
});
test('wrong classifications remain diagnostic and receive explicit comparison feedback',()=>{
  const {dom,item,ctx,q,click,lessons}=setup('02.02');try{
    const block=dom.window.DevPathStage02UI.getState(item,ctx.progress).blocks[0];
    block.prediction=JSON.stringify(lessons.lessons[item.id][0].rows.map(()=>({value:'0',type:'number',falsy:'não',nullish:'não'})));
    block.predictionSaved=true;block.understood=true;
    block.code='const x=false;console.log(x||"padrão",x??"padrão");';ctx.render();click('run');
    assert.match(q('[data-s02-results]').textContent,/Divergência na classificação/);
    assert.match(q('[data-s02-results]').textContent,/regra: falsy=sim, nullish=não/);
    assert.equal(block.predictionSaved,true);
  }finally{dom.window.close();}
});
test('catalog completion rejects a saved approval that fails the current payment boundary',()=>{
  const {dom,item,ctx}=setup('02.03');try{
    const ui=dom.window.DevPathStage02UI,state=ui.getState(item,ctx.progress),block=state.blocks[0];
    block.prediction='Os dois requisitos precisam ser verdadeiros.';block.predictionSaved=true;block.understood=true;
    block.code='const saldo=10;const valor=8;const ativa=true;const suficiente=saldo>valor;const autorizada=ativa===true;const podePagar=suficiente&&autorizada;console.log(podePagar);';
    block.passedCode=block.code;state.complete=true;
    assert.equal(ui.complete(item,ctx.progress),false);
  }finally{dom.window.close();}
});

test('lesson journey keeps all five destinations accessible while practice is locked',()=>{
  const {dom,q,ctx,item}=setup('02.01');try{
    const destinations=['learn','challenge','predict','practice','explain'];
    for(const name of destinations){
      const button=q(`[data-s02-target="${name}"]`),section=q(`#s02-${name}`);
      assert(button && section);assert.equal(section.getAttribute('tabindex'),'-1');
      let scrolled=false;section.scrollIntoView=()=>{scrolled=true;};
      dom.window.DevPathStage02UI.handleClick({target:button},item,ctx);
      assert.equal(dom.window.document.activeElement,section);assert(scrolled);
      assert.equal(q('[data-s02-target][aria-current="step"]'),button);
    }
    assert.equal(q('[data-s02-code]'),null);
    assert(q('[data-s02-teaching]'));
  }finally{dom.window.close();}
});
test('all seventeen blocks show vocabulary, specific task steps and actual example output',()=>{
  let count=0;
  for(const item of catalog.filter(item=>item.stage==='02')){
    const {dom,ctx,q,lessons}=setup(item.id);try{
      for(let i=0;i<lessons.lessons[item.id].length;i++){
        dom.window.DevPathStage02UI.getState(item,ctx.progress).index=i;ctx.render();count++;
        assert(q('.s02-vocabulary dt'));assert.equal(q('#s02-challenge>ol').children.length,3);
        const result=dom.window.DevPathStage02Runner.run(q('[data-s02-example-code]').textContent);
        const output=result.lines.map(line=>line.values.map(dom.window.DevPathStage02Runner.format).join(', ')).join('\n');
        assert.equal(q('.s02-example-result').textContent,output);
      }
    }finally{dom.window.close();}
  }
  assert.equal(count,17);
});
