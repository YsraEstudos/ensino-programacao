import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
const root = new URL('../public/', import.meta.url);
const catalog = JSON.parse(readFileSync(new URL('course-catalog.json', root), 'utf8'));
const lessons = catalog.filter(item => item.stage === '00');
assert.equal(lessons.length, 9);
const dom = new JSDOM('<div id="view"></div>', {runScripts:'outside-only', url:'http://localhost'});
dom.window.HTMLElement.prototype.scrollIntoView = function() {};
for (const file of ['js-stage00-runner.js', 'js-stage00-preparation.js']) dom.window.eval(readFileSync(new URL(file, root), 'utf8'));
const ui = dom.window.DevPathStage00Preparation;
let saves = 0;
const progress = {exercisePredictions:{},exerciseDrafts:{},exerciseReflections:{},exerciseEvidence:{},warmupCompleted:{},answers:{},exerciseVersions:{},completed:[],reviewSchedule:{}};
const context = {progress,saveProgress:()=>saves++,scheduleSave:()=>saves++,render:()=>{}};
const view=dom.window.document.querySelector('#view');
const click = action => {const button=view.querySelector(`[data-s00-action="${action}"]`);assert(button);ui.handleClick({target:button,preventDefault(){}},catalog.find(x=>x.id===view.querySelector('[data-s00-id]').dataset.s00Id),context);};
const labClick = (selector,item) => {const button=view.querySelector(selector);assert(button,selector);ui.handleClick({target:button,preventDefault(){}},item,context);};
const fill = (selector,value,item)=>{const input=view.querySelector(selector);assert(input);input.value=value;ui.handleInput({target:input},item,context);};
for(const item of lessons){
  assert(item.preparation?.vocabulary?.length>=3,`${item.id}: teach vocabulary`);
  assert(item.preparation?.steps?.length>=3,`${item.id}: instructions`);
  assert(item.preparation?.example?.code && item.preparation?.example?.output,`${item.id}: solved example`);
  assert(!/Mostre |Apresente |leitor de tela|O aprendiz/.test(item.interaction),`${item.id}: learner-facing instructions`);
  view.innerHTML=ui.render(item,context);
  if(item.preparation.lab)assert(view.querySelector(`[data-s00-lab="${item.preparation.lab.kind}"]`),`${item.id}: interactive lab renders`);
  if(item.id==='00.01'){
    assert(view.querySelector('.s00-glossary'),'secondary vocabulary remains available on demand');
    assert.equal(view.querySelector('[data-s00-lab-output]'),null,'trace asks for a prediction before showing output');
    labClick('[data-s00-lab-choice="0"]',item);labClick('[data-s00-lab-action="confirm-trace"]',item);
    assert.match(view.querySelector('[data-s00-lab-output]').textContent,/abrir/);
    labClick('[data-s00-lab-action="next"]',item);labClick('[data-s00-lab-choice="0"]',item);labClick('[data-s00-lab-action="confirm-trace"]',item);
    assert.match(view.querySelector('[data-s00-lab-output]').textContent,/5/,'trace reveals expression evaluation and accumulated output');
  }
  if(item.id==='00.02'){
    labClick('[data-s00-lab-choice="0"]',item);
    assert.match(view.querySelector('[data-s00-lab-feedback]').textContent,/última execução/,'diagnosis is explained with evidence');
    labClick('[data-s00-lab-action="case"][data-s00-lab-index="1"]',item);
    assert.match(view.textContent,/Arquivo salvo: console\.log/,'unsaved edits are a distinct diagnostic case');
    labClick('[data-s00-lab-action="case"][data-s00-lab-index="2"]',item);
    assert.match(view.textContent,/rascunho\.js/,'running the wrong file is a distinct diagnostic case');
  }
  if(item.id==='00.04'){
    assert.match(view.querySelector('.s00-argument-preview').textContent,/pontos:.*0.*número/,'the argument preview separates text and numeric value before the call');
    assert.match(view.querySelector('[data-s00-lab-code]').textContent,/console\.log/);
    assert.match(view.querySelector('[data-s00-lab-output]').textContent,/Pagamento aprovado/);
  }
  if(item.id==='00.05'){
    assert.equal(view.querySelectorAll('[data-s00-lab-case]').length,2,'environment bridge includes console and Node tasks');
    assert.match(view.textContent,/undefined/,'browser console return value is explained as separate from output');
    assert.match(view.textContent,/pasta desse arquivo/,'terminal exercise explains the working folder');
  }
  if(item.id==='00.08'){
    assert.match(view.querySelector('[data-s00-lab-code]').textContent,/id="cliente"/);
    assert.match(view.querySelector('[data-s00-lab-tree]').textContent,/id=cliente/);
    assert.notEqual(view.querySelector('.s00-html-lab label').htmlFor,view.querySelector('[data-s00-preview-input]').id,'the broken preview reproduces a disconnected label');
    labClick('[data-s00-lab-action="html-fix"]',item);
    assert.match(view.querySelector('[data-s00-lab-code]').textContent,/id="nome"/,'HTML correction synchronizes the preview');
    assert.match(view.querySelector('[data-s00-lab-tree]').textContent,/id=nome/);
    assert.equal(view.querySelector('.s00-html-lab label').htmlFor,view.querySelector('[data-s00-preview-input]').id,'the repaired preview connects the label to the field');
  }
  const teaching=view.querySelector('[data-s00-teaching]');
  assert(teaching && !teaching.hidden,`${item.id}: explanation visible without an answer`);
  assert(teaching.compareDocumentPosition(view.querySelector('[data-s00-prediction]'))&dom.window.Node.DOCUMENT_POSITION_FOLLOWING);
  for(const button of view.querySelectorAll('[data-s00-target]'))assert(view.querySelector(`[id="${button.dataset.s00Target}"]`));
  if(item.id==='00.01'){
    // Navigation keeps keyboard focus and disables smooth scrolling when motion is reduced.
    let behavior;const scroll=dom.window.HTMLElement.prototype.scrollIntoView;
    dom.window.HTMLElement.prototype.scrollIntoView=function(options){behavior=options.behavior;};
    const steps=[...view.querySelectorAll('[data-s00-target]')];
    dom.window.matchMedia=()=>({matches:true});
    ui.handleClick({target:steps[2],preventDefault(){}},item,context);
    assert.equal(behavior,'auto');assert.equal(dom.window.document.activeElement.id,steps[2].dataset.s00Target);
    assert.equal(steps[2].getAttribute('aria-current'),'step');
    assert.equal(view.querySelectorAll('[data-s00-target][aria-current]').length,1);
    dom.window.matchMedia=()=>({matches:false});
    ui.handleClick({target:steps[0],preventDefault(){}},item,context);assert.equal(behavior,'smooth');
    delete dom.window.matchMedia;dom.window.HTMLElement.prototype.scrollIntoView=scroll;
  }
  assert(view.querySelector('[data-s00-action="complete"]').disabled);
  click('predict');assert(!progress.warmupCompleted[ui.key(item)],'empty response cannot unlock');
  if(item.preparation.mode==='debug')click('run');
  fill('[data-s00-prediction]','Linha 1: abertura; linha 2: número; linha 3: fim. Confiança: 60%.',item);click('predict');
  assert(progress.warmupCompleted[ui.key(item)]);
  view.innerHTML=ui.render(item,context);
  assert(view.querySelector('[data-s00-teaching]'));
  if(item.id==='00.01'){
    click('run');assert.match(view.querySelector('[data-s00-output]').textContent,/A\n5\nB/);
    fill('[data-s00-reflection]','A soma é calculada antes de aparecer na segunda linha.',item);
    view.querySelectorAll('[data-s00-rubric]').forEach(x=>x.checked=true);
    click('complete');assert(progress.answers[item.id]);
    assert(progress.reviewSchedule[item.id]);
    const saved=JSON.parse(JSON.stringify(progress));view.innerHTML=ui.render(item,{...context,progress:saved});
    assert.match(view.querySelector('[data-s00-action="complete"]').textContent,/concluída/);
  }
  if(item.id==='00.06'){
    // Initial execution is available even before the first response.
    delete progress.warmupCompleted[ui.key(item)];view.innerHTML=ui.render(item,context);click('run');
    assert.match(view.querySelector('[data-s00-output]').textContent,/SyntaxError/);
    fill('[data-s00-editor]', 'console.log("Olá");\nconsle.log("fim");\nconsole.log("erro");',item);click('run');
    assert.match(view.querySelector('[data-s00-output]').textContent,/ReferenceError/);
    fill('[data-s00-editor]', 'console.log("Olá");\nconsole.log("fim");\nconsole.log("erro");',item);click('run');
    assert.match(view.querySelector('[data-s00-output]').textContent,/diferença|divergência/);
  }
}
const runner=dom.window.DevPathStage00Runner;
assert.equal(runner.interpret('// nota\nconsole.log("ok");').ok,true);
assert.equal(runner.interpret('consle.log("fim");\nconsole.log("Olá);').error.kind,'syntax','syntax is detected before runtime');
assert.equal(runner.interpret('console.log("Olá");\nconsle.log("fim");').error.kind,'runtime');
assert(saves>0);
dom.window.close();
console.log('Stage 00: all 9 explanations precede answers; navigation, execution, debugging, completion and persistence checked.');

// Exercise the actual application listeners and server-backed save/reload flow.
const settle=async()=>{for(let i=0;i<5;i++)await new Promise(resolve=>setImmediate(resolve));};
let accountProgress={};
async function loadApp(){
  const app=new JSDOM(readFileSync(new URL('devpath.html',root),'utf8'),{url:'http://localhost/devpath.html',runScripts:'outside-only'});
  app.window.HTMLElement.prototype.scrollIntoView=function(){};
  app.window.matchMedia=()=>({matches:true,addEventListener(){}});
  app.window.fetch=async (url,options={})=>{
    if(url==='/course-catalog.json')return {ok:true,json:async()=>catalog};
    if(url==='/api/progress'){
      if(options.method==='PUT')accountProgress=JSON.parse(options.body);
      return {ok:true,json:async()=>({progress:JSON.parse(JSON.stringify(accountProgress))})};
    }
    return {ok:false,json:async()=>({})};
  };
  for(const script of app.window.document.querySelectorAll('script[src]'))app.window.eval(readFileSync(new URL(script.getAttribute('src').split('?')[0].slice(1),root),'utf8'));
  await settle();return app;
}
const solutions={
  '00.03':'console.log("Início");\nconsole.log("Olá, Ana");\nconsole.log("Fim");',
  '00.04':'console.log("nome:", "Ana");\nconsole.log("pontos:", 0);\nconsole.log("fim");',
  '00.07':'console.log("início");\nconsole.log(0);\nconsole.log("fim");',
  '00.06':'console.log("Olá");\nconsole.log("fim");\nconsole.log("ok");',
  '00.09':'console.log("Atendimento");\nconsole.log("Pessoa:", "Ana");\nconsole.log("Itens:", 0);\nconsole.log("Fim");'
};
const app=await loadApp();
const aq=selector=>app.window.document.querySelector(selector);
const afill=(selector,value)=>{const node=aq(selector);assert(node,selector);node.value=value;node.dispatchEvent(new app.window.Event('input',{bubbles:true}));};
for(const item of lessons){
  app.window.location.hash=`#/javascript/${item.id}`;await settle();
  assert(aq('[data-s00-teaching]'),`${item.id}: application uses new renderer`);
  const first=aq('[data-s00-target]');first.click();assert.equal(app.window.document.activeElement.id,first.dataset.s00Target);
  if(item.id==='00.06'){aq('[data-s00-action="run"]').click();assert.match(aq('[data-s00-output]').textContent,/SyntaxError/);}
  afill('[data-s00-prediction]','Registrei uma previsão ou plano depois de estudar o exemplo.');aq('[data-s00-action="predict"]').click();
  if(item.id==='00.09')aq('[data-s00-lab-action="zero-requirement"]').click();
  if(solutions[item.id])afill('[data-s00-editor]',solutions[item.id]);
  if(aq('[data-s00-action="run"]'))aq('[data-s00-action="run"]').click();
  if(aq('[data-s00-action="write"]')){
    const answer=item.id==='00.05'?'Array: padrão; document: navegador; process e node:fs: Node; console e fetch: os dois ambientes; npm e TypeScript: externos.':item.id==='00.08'?'form é pai de label, input e button. for=nome corresponde a id=nome; a classe do campo é campo.':'Linha 1: abrir. Linha 2: 3. Linha 3: fechar. Sem 1: 3/fechar. Sem 2: abrir/fechar. Sem 3: abrir/3.';
    afill('[data-s00-file="resposta.md"]',answer);aq('[data-s00-action="write"]').click();
  }
  afill('[data-s00-reflection]','Conferi o resultado com a previsão e expliquei a regra usando o exemplo anterior.');
  for(const input of app.window.document.querySelectorAll('[data-s00-rubric]'))input.click();
  if(item.id==='00.09'){
    assert(aq('[data-s00-action="complete"]').disabled,'capstone requires both transfer responses before completion');
    afill('[data-s00-lab-transfer="0"]','A saída seria iniciar, mostrar 2 e encerrar a tarefa.');
    afill('[data-s00-lab-transfer="1"]','O console prova que mostrou texto; eu verificaria o registro real no sistema.');
  }
  assert.equal(aq('[data-s00-action="complete"]').disabled,false,`${item.id}: valid attempt can complete`);
  aq('[data-s00-action="complete"]').click();await settle();
  assert(accountProgress.answers[item.id],`${item.id}: saved to account`);
  assert.equal(accountProgress.exerciseVersions[item.id],4);
  const reloaded=await loadApp();reloaded.window.location.hash=`#/javascript/${item.id}`;await settle();
  assert.match(reloaded.window.document.querySelector('[data-s00-action="complete"]').textContent,/concluída/);
  reloaded.window.close();
}
// Existing historical attempts remain untouched by this editorial revision.
assert.equal(Object.keys(accountProgress.exercisePredictions).filter(x=>x.endsWith('@v4')).length,9);
app.window.close();
console.log('Stage 00 app integration: all 9 activities completed through real click/input listeners and reloaded from account progress.');
