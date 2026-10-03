import fs from 'node:fs';
import {JSDOM} from 'jsdom';
export const publicRoot=new URL('../public/',import.meta.url);
export const catalog=JSON.parse(fs.readFileSync(new URL('course-catalog.json',publicRoot)));
export const solutions={
  '03.04':'const nota=20;let faixa="";if(nota<0||nota>100){faixa="inválida";}else if(nota<20){faixa="E";}else if(nota<40){faixa="D";}else if(nota<60){faixa="C";}else if(nota<80){faixa="B";}else{faixa="A";}console.log(faixa);',
  '03.06':'let fila=3;while(fila>0){if(fila===2){console.log("pausa");fila--;continue;}fila--;}console.log(fila);',
  '03.07':'const n=10;const limite=4;const divisor=2;let contagem=0;for(let i=1;i<=n;i++){if(i>limite&&i%divisor===0)contagem++;}console.log(contagem);',
  '03.08':'const ticks=20;const chegadasPorTick=1;let fila=0;let atendidos=0;for(let tick=1;tick<=ticks;tick++){fila+=chegadasPorTick;if(tick%2===0&&fila>0){fila--;atendidos++;}}console.log(fila,atendidos);',
  '03.09':'let heroi=12;let monstro=9;let turnos=0;const maxTurnos=20;const danoHeroi=3;const danoMonstro=2;while(heroi>0&&monstro>0&&turnos<maxTurnos){monstro-=danoHeroi;if(monstro<0)monstro=0;if(monstro>0){heroi-=danoMonstro;if(heroi<0)heroi=0;}turnos++;}let resultado="empate";if(heroi===0){resultado="monstro";}else if(monstro===0){resultado="heroi";}console.log(heroi,monstro,turnos,resultado);',
};
export const secondary={
  '03.04':'const estado="aberto";let mensagem="";switch(estado){case "aberto":mensagem="aberto";break;case "fechado":mensagem="fechado";break;default:mensagem="desconhecido";}console.log(mensagem);',
  '03.06':'let encontrado=0;let i=0;while(i<4){const valor=2-i;if(valor<0){encontrado=valor;break;}i++;}console.log(encontrado,i);',
};
export const transfers={
  '03.08':'let fila=0;let atendidos=0;for(let tick=1;tick<=6;tick++){if(tick===1||tick===2||tick===4||tick===6)fila++;if((tick===2||tick===3||tick===5||tick===6)&&fila>0){fila--;atendidos++;}}console.log(fila,atendidos);',
  '03.09':solutions['03.09'].replace('heroi=12','heroi=8').replace('monstro=9','monstro=6').replace('maxTurnos=20','maxTurnos=5'),
};
export function setup(id) {
  const dom=new JSDOM('<main id="view"></main>',{runScripts:'outside-only',url:`http://localhost/devpath.html#/javascript/${id}`});
  const w=dom.window;
  for(const file of ['preparation','runner','checks','ui'])w.eval(fs.readFileSync(new URL(`js-stage03-${file}.js`,publicRoot),'utf8'));
  const item=catalog.find(x=>x.id===id),progress={};let saved=0;
  const ctx={progress,activities:catalog,saveProgress(){saved++;},scheduleSave(){saved++;},toast(){},render(){w.document.querySelector('#view').innerHTML=w.DevPathStage03UI.render(item,ctx);}};
  ctx.render();
  const q=selector=>w.document.querySelector(selector);
  const click=action=>w.DevPathStage03UI.handleClick({target:q(`[data-s03-action="${action}"]`)},item,ctx);
  const fill=(selector,value)=>{const el=q(selector);el.value=value;w.DevPathStage03UI.handleInput({target:el},item,ctx);};
  const table=()=>{const config=w.DevPathStage03Preparation[id];(config.table?.rows.flatMap(r=>r.expected)||[]).forEach((v,i)=>fill(`[data-s03-cell="${i}"]`,v));};
  const predict=()=>{fill('[data-s03-prediction]','Minha previsão acompanha a condição e a atualização.');click('predict');};
  return {dom,w,item,ctx,q,click,fill,table,predict,saved:()=>saved};
}
