import {withPublicDependencies} from './public-test-source.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({});
vm.runInContext(withPublicDependencies(fs.readFileSync(new URL('../public/js-stage03-runner.js',import.meta.url),'utf8')),context);
const run=(code,input={})=>JSON.parse(JSON.stringify(context.DevPathStage03Runner.run(code,input)));
test('for continue still advances and break exits only its loop',()=>{
  const result=run('let soma=0; for(let i=1;i<=5;i++){if(i%2===0)continue; soma+=i;} console.log(soma);');
  assert.equal(result.ok,true,result.error);assert.deepEqual(result.values,[9]);
  assert.deepEqual(run('let soma=0;for(let i=0;i<3;i++){for(let j=0;j<5;j++){if(j===2)break;soma++;}} console.log(soma);').values,[6]);
});
test('switch selects default and supports fallthrough and strict comparison',()=>{
  const code='const estado="aberto";let mensagem="";switch(estado){case "aberto":mensagem="aberto";break;case "fechado":mensagem="fechado";break;default:mensagem="desconhecido";} console.log(mensagem);';
  assert.deepEqual(run(code,{estado:'pausado'}).values,['desconhecido']);
  assert.deepEqual(run('let x=0;switch(1){default:x=9;break;case 1:x=1;case 2:x+=2;}console.log(x);').values,[3]);
  assert.deepEqual(run('let x=0;switch("1"){case 1:x=1;break;default:x=2;}console.log(x);').values,[2]);
});
test('while with no progress terminates evaluation without touching host globals',()=>{
  assert.equal(run('let fila=3;while(fila>0){if(fila===2)continue;fila--;}').ok,false);
  assert.match(run('while(true){}').error,/passos/);
  for(const code of ['fetch("x");','globalThis.x=1;','const a=[];','let x=1; x.constructor();'])assert.equal(run(code).ok,false);
});
test('lexical scope, const and top level fixture substitution match the exercises',()=>{
  assert.equal(run('const x=1; x++;').ok,false);
  assert.deepEqual(run('let x=1;{let x=2;console.log(x);}console.log(x);').values,[2,1]);
  assert.equal(run('for(let i=1;i<2;i++){}console.log(i);').ok,false);
  assert.deepEqual(run('let fila=3;while(fila>0){fila--;}console.log(fila);',{fila:1}).values,[0]);
  assert.deepEqual(run('const n=2;for(let i=0;i<n;i++){const n=7;console.log(n);}',{n:1}).values,[7]);
});
