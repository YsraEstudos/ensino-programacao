import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
const publicRoot = new URL('../public/',import.meta.url);
const runnerPath = new URL('js-stage02-runner.js', publicRoot);
const context = { globalThis: {} };
if (existsSync(runnerPath)) vm.runInNewContext(withPublicDependencies(readFileSync(runnerPath,'utf8')), context);
const runner = context.globalThis.DevPathStage02Runner;
test('stage02 executes operators and preserves string, bigint, NaN and signed zero',()=>{
  assert(runner,'Stage02 runner must exist');
  const result=runner.run('console.log(2+3*4, "2"+3, 0??9, null??9, typeof 1n, NaN, Math.round(-0.5));');
  assert.equal(result.ok,true);
  assert.deepEqual(Array.from(result.values).map(runner.format),['14','"23"','0','9','"bigint"','NaN','-0']);
});
test('finite validation runs with overridden declared fixtures',()=>{
  assert(runner);
  const source='const texto="12"; const vazio=false; const numero=Number(texto); console.log(vazio || !Number.isFinite(numero));';
  assert.equal(runner.run(source,{texto:'Infinity',vazio:false}).values[0],true);
  assert.equal(runner.run(source,{texto:'0',vazio:false}).values[0],false);
  assert.equal(runner.run(source,{texto:'',vazio:true}).values[0],true);
  assert.equal(runner.run(source,{notDeclared:4}).ok,false);
});
test('unsupported global access and unbounded programs are rejected',()=>{
  assert(runner);
  for(const code of ['fetch("/api/progress");','while(true){}','console.log(window);','console.log(Math.constructor("return document")());','const x=1; x=2;','console.log(unknown);']) assert.equal(runner.run(code).ok,false,code);
});
test('logical operators short-circuit before evaluating missing identifiers',()=>{
  assert(runner);
  assert.equal(runner.run('console.log(false && unknown, true || unknown, 0 ?? unknown);').ok,true);
});

vm.runInNewContext(withPublicDependencies(readFileSync(new URL('js-stage02-lessons.js',publicRoot),'utf8')),context);
vm.runInNewContext(withPublicDependencies(readFileSync(new URL('js-stage02-ui.js',publicRoot),'utf8')),context);
const lessons=context.globalThis.DevPathStage02Lessons;
const solutions={
  '02.01':[
    'console.log(2+3*4,(2+3)*4,9-4,6%4,8/2,2**3);',
    'console.log(0===false,5>3,5>=5,!0,true&&false,false||"x","2"+3);',
    'console.log(0==="0",0=="0",0!=="0",3!==3);',
  ],
  '02.02':['const x=false;console.log(x||"padrão",x??"padrão");'],
  '02.03':['const saldo=10;const valor=8;const ativa=true;const suficiente=saldo>=valor;const autorizada=ativa===true;const podePagar=suficiente&&autorizada;console.log(podePagar);'],
  '02.04':['const texto="12";const vazio=false;const numero=Number(texto);const invalido=vazio||!Number.isFinite(numero);console.log(invalido);'],
  '02.05':['const quantidade="3";const preco="10";const quantidadeVazia=false;const precoVazio=false;const quantidadeNumero=Number(quantidade);const precoNumero=Number(preco);const entradaValida=!quantidadeVazia&&!precoVazio&&Number.isFinite(quantidadeNumero)&&Number.isFinite(precoNumero);const total=quantidadeNumero*precoNumero;const etiqueta=String(total)+" reais";console.log(entradaValida,total,etiqueta);'],
  '02.06':['const volumeEntrada=0;const volume=volumeEntrada??50;console.log(volume);'],
  '02.07':['const preco=100;const taxa=0.2;const total=preco*(1-taxa);console.log(total);'],
  '02.08':['const volumeEntrada=0;const temaEntrada="";const notificacoesEntrada=false;const volume=volumeEntrada??50;const tema=temaEntrada??"claro";const notificacoes=notificacoesEntrada??true;console.log(volume,tema,notificacoes);'],
  '02.09':['const aEntrada=0;const bEntrada=5;const a=aEntrada??0;const b=bEntrada??0;const total=a+b;console.log(a,b,total);'],
  '02.10':[
    'const segundos=89;const segundosNegativos=-89;console.log(Math.floor(segundos/60),Math.ceil(segundos/60),Math.round(segundos/60),Math.trunc(segundos/60));console.log(Math.floor(segundosNegativos/60),Math.ceil(segundosNegativos/60),Math.round(segundosNegativos/60),Math.trunc(segundosNegativos/60));',
    'const x=3;const y=5;const deslocamento=-3;console.log(Math.min(x,y),Math.max(x,y),Math.abs(deslocamento));',
    'const sorteio=Math.random();const face=Math.floor(sorteio*6)+1;console.log(sorteio,face);',
  ],
  '02.11':['console.log(0.5+0.25===0.75,0.1+0.2,0.1+0.2===0.3,Number.isNaN(NaN),Number.isFinite(Infinity));','console.log(Number.isSafeInteger(2**53-1),Number.isSafeInteger(2**53),typeof 1n);'],
  '02.12':['const a=2000.3;const b=2000.304;const resolucao=0.01;const tolerancia=resolucao/2;console.log(tolerancia,Math.abs(a-b)<=tolerancia);'],
};
for(const [id,blocks] of Object.entries(solutions)) for(const [index,source] of blocks.entries()) {
  test(`${id} block ${index+1}: all visible cases execute through the real interpreter`,()=>{
    const result=lessons.check(id,index,source);
    assert.equal(result.ok,true,JSON.stringify(result));
    assert.equal(lessons.check(id,index,lessons.lessons[id][index].starter).ok,false,'Unchanged starter cannot complete the block');
  });
}
test('common wrong solutions fail their actual public edge cases',()=>{
  assert.equal(lessons.check('02.04',0,solutions['02.04'][0].replace('!Number.isFinite(numero)','Number.isNaN(numero)')).ok,false);
  assert.equal(lessons.check('02.03',0,solutions['02.03'][0].replace('suficiente&&autorizada','suficiente||autorizada')).ok,false);
  assert.equal(lessons.check('02.06',0,solutions['02.06'][0].replace('??','||')).ok,false);
  assert.equal(lessons.check('02.10',2,solutions['02.10'][2].replace('Math.floor','Math.round')).ok,false);
  assert.equal(lessons.check('02.12',0,solutions['02.12'][0].replace('resolucao/2','Number.EPSILON')).ok,false);
  assert.equal(lessons.check('02.12',0,solutions['02.12'][0].replace('<=','<')).ok,false);
});
test('completion requires predictions, understanding and exact checked code; legacy answers do not suffice',()=>{
  const ui=context.globalThis.DevPathStage02UI;
  const progress={answers:{'02.01':true}};
  const state=ui.getState({id:'02.01'},progress);
  assert.equal(ui.complete({id:'02.01'},progress),false);
  state.complete=true;
  state.blocks.forEach((block,index)=>Object.assign(block,{prediction:JSON.stringify(lessons.lessons['02.01'][index].cases.flatMap(entry=>entry.expected).map(value=>({value:runner.format(value),type:typeof value}))),predictionSaved:true,understood:true,code:solutions['02.01'][index],passedCode:solutions['02.01'][index]}));
  assert.equal(ui.complete({id:'02.01'},progress),true);
  state.blocks[0].code+='\nconsole.log(0);';
  assert.equal(ui.complete({id:'02.01'},progress),false);
});
test('unsupported mixes mirror JavaScript syntax errors',()=>{
  assert.equal(runner.run('console.log(0 ?? false || 1);').ok,false);
  assert.equal(runner.run('console.log((0 ?? false) || 1);').ok,true);
  assert.equal(runner.run('console.log(-2 ** 2);').ok,false);
  assert.equal(runner.run('console.log((-2) ** 2);').values[0],4);
});
test('numeric environment bounds expensive arithmetic and growing strings',()=>{
  assert.equal(runner.run('console.log(2n ** 2000n);').ok,false);
  assert.equal(runner.run('let x="a";'+Array(14).fill('x=x+x;').join('')+'console.log(x);').ok,false);
});

export {solutions};
import {withPublicDependencies} from './public-test-source.mjs';
