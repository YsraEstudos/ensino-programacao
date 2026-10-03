import test from 'node:test';
import assert from 'node:assert/strict';
import {setup,catalog,solutions,secondary,transfers} from './stage03-test-helpers.mjs';
test('all examples execute and correct varied implementations satisfy checks',()=>{
  for(const item of catalog.filter(x=>x.stage==='03')) {const {dom,w}=setup(item.id);try{const p=w.DevPathStage03Preparation[item.id];assert.equal(w.DevPathStage03Runner.run(p.teaching.code).ok,true,item.id);if(p.secondaryPractice?.demonstration)assert.equal(w.DevPathStage03Runner.run(p.secondaryPractice.demonstration.code).ok,true);if(item.id!=='03.05'&&!p.parsons)assert.equal(w.DevPathStage03Checks.check(item.id,solutions[item.id]||p.starter).ok,true,item.id);if(secondary[item.id])assert.equal(w.DevPathStage03Checks.checkFixtures(secondary[item.id],p.secondaryPractice.fixtures).ok,true);if(transfers[item.id])assert.equal(w.DevPathStage03Checks.checkFixtures(transfers[item.id],p.transfer.fixtures).ok,true);}finally{dom.window.close();}}
});
test('counting cases detect equality, final endpoint and OR mistakes',()=>{
  const {dom,w}=setup('03.07');try{for(const code of [solutions['03.07'].replace('i>limite','i>=limite'),solutions['03.07'].replace('i<=n','i<n'),solutions['03.07'].replace('&&','||')])assert.equal(w.DevPathStage03Checks.check('03.07',code).ok,false);}finally{dom.window.close();}
});
test('battle rejects dead counterattack, negative HP and unbounded zero damage',()=>{
  const {dom,w}=setup('03.09');try{const c=solutions['03.09'];for(const bad of [c.replace('if(monstro>0)','if(true)'),c.replace('if(monstro<0)monstro=0;',''),c.replace('&&turnos<maxTurnos','')])assert.equal(w.DevPathStage03Checks.check('03.09',bad).ok,false);}finally{dom.window.close();}
});
test('queue detects missing empty-state guard',()=>{
  const {dom,w}=setup('03.08');try{assert.equal(w.DevPathStage03Checks.check('03.08',solutions['03.08'].replace('&&fila>0','')).ok,false);}finally{dom.window.close();}
});
