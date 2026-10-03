import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import test from 'node:test';
{ const site = 'canonical';
  const source=fs.readFileSync(new URL('../app/api/progress/route.ts',import.meta.url),'utf8').replace(/^import .*;$/gm,'');
  const context={exports:{},courseExerciseIds:['03.04','03.08','03.09'],sanitizeStage01Progress:()=>({})};
  vm.runInNewContext(ts.transpileModule(source+'\nglobalThis.testSanitize=sanitize;',{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,context);
  test(`${site}: existing API retains Stage 03 versioned drafts, evidence and review`,()=>{
    const key='03.09@v2',draft=JSON.stringify({code:'let heroi=12;',cells:['8','0'],transfer:'console.log(6,0,2,"heroi");',transferPrediction:'A vence na rodada dois.'});
    const evidence={status:'executed',runResult:'result',output:'Os casos passaram.',rubric:[0,1,2],runCount:1};
    const input={exerciseDrafts:{[key]:draft},exerciseEvidence:{[key]:evidence},exercisePredictions:{[key]:'O herói ataca antes do monstro.'},exerciseReflections:{[key]:'O derrotado não responde.'},warmupCompleted:{[key]:true},completed:['03.09'],answers:{'03.09':true},exerciseVersions:{'03.09':2},reviewSchedule:{'03.09':{intervalIndex:0,dueAt:2000000000}}};
    const saved=context.testSanitize(input);
    assert.equal(saved.exerciseDrafts[key],draft);assert.equal(saved.exerciseEvidence[key].runResult,'result');assert.equal(saved.warmupCompleted[key],true);assert.equal(saved.exerciseVersions['03.09'],2);assert.equal(saved.answers['03.09'],true);assert.equal(saved.reviewSchedule['03.09'].dueAt,2000000000);
  });
}
