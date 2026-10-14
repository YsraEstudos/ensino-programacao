import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, mkdirSync, rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const manifest=JSON.parse(readFileSync('course-src/assessments.json','utf8'));
const targetIds=Object.keys(manifest).filter(id=>/^(20|21|22|23)\./.test(id));
const matches=(actual,expected)=>JSON.stringify(actual)===JSON.stringify(expected);
function installAssertions(cases){
  globalThis.test=(name,body)=>cases.push({name,body});
  globalThis.describe=(_name,body)=>body();
  globalThis.expect=actual=>({
    toBe(expected){assert.strictEqual(actual,expected);},
    toEqual(expected){assert.deepStrictEqual(actual,expected);},
    toBeTruthy(){assert.ok(actual);},
    toBeGreaterThan(expected){assert.ok(actual>expected,`${actual} is not greater than ${expected}`);},
    toBeLessThanOrEqual(expected){assert.ok(actual<=expected,`${actual} is not <= ${expected}`);},
    toContain(expected){assert.ok(actual?.includes?.(expected),`${JSON.stringify(actual)} does not contain ${JSON.stringify(expected)}`);},
    toThrow(Expected){assert.equal(typeof actual,'function');let caught;try{actual();}catch(error){caught=error;}assert.ok(caught,'expected function to throw');if(Expected)assert.ok(caught instanceof Expected,`expected ${Expected.name}, got ${caught.constructor.name}`);},
  });
}
async function execute(id, assessment, variantFiles){
  const tmp=path.join(os.tmpdir(),`devpath-task9-${id.replace('.','-')}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(tmp,{recursive:true});
  try{
    const map=new Map(assessment.correctFiles.map(file=>[file.path,file.content]));
    for(const file of variantFiles||[])map.set(file.path,file.content);
    const test=readFileSync(`course-src/tests/${id}.test.js`,'utf8');
    map.set('__tests__.js',test);
    writeFileSync(path.join(tmp,'package.json'),'{"type":"module"}');
    for(const [file,content] of map){const destination=path.resolve(tmp,file);assert.ok(destination.startsWith(tmp+path.sep));mkdirSync(path.dirname(destination),{recursive:true});writeFileSync(destination,content);}
    const cases=[];installAssertions(cases);await import(`${pathToFileURL(path.join(tmp,'__tests__.js')).href}?run=${Math.random()}`);
    assert.ok(cases.length>0,`${id} test suite is empty`);
    const failures=[];for(const entry of cases)try{await entry.body();}catch(error){failures.push({name:entry.name,error});}
    return {total:cases.length,passed:cases.length-failures.length,failures};
  }finally{rmSync(tmp,{recursive:true,force:true});}
}

let failed=false,executed=0;
const evidence=[];
for(const id of targetIds){
  const assessment=manifest[id];
  if(assessment.studentSuiteKind==='types'||['local','rubric','dom','network'].includes(assessment.environment)){
    const gate=assessment.studentSuiteKind==='types'?'real TypeScript compiler':['dom','network'].includes(assessment.environment)?'bounded real-browser fixture':'local/rubric evidence';
    console.log(`${id}: ${gate} required; skipped by Node runtime harness.`);
    evidence.push({id,environment:assessment.environment,gate,status:'not-run'});
    continue;
  }
  executed++;
  if(!Array.isArray(assessment.correctFiles)||!assessment.correctFiles.length)continue;
  const testPath=`course-src/tests/${id}.test.js`;
  let reference;
  try{reference=await execute(id,assessment,[]);}catch(error){reference={total:0,passed:0,failures:[{name:'reference setup',error}]};}
  const mutants=assessment.mutantDirs||[];
  const mutantRuns=[];
  for(const mutant of mutants){try{mutantRuns.push([mutant.id,await execute(id,assessment,mutant.files)]);}catch(error){mutantRuns.push([mutant.id,{total:0,passed:0,failures:[{name:'mutant setup',error}]}]);}}
  const referenceOk=reference.total>0&&reference.passed===reference.total;
  const mutantsOk=mutantRuns.length===0||mutantRuns.every(([,result])=>result.total>0&&result.passed<result.total);
  evidence.push({id,environment:assessment.environment,gate:'contained Node reference/mutant harness',reference:{passed:reference.passed,total:reference.total,failed:reference.failures?.map(item=>item.name)||[]},mutants:mutantRuns.map(([name,result])=>({id:name,passed:result.passed,total:result.total,killed:result.total>0&&result.passed<result.total,failures:result.failures?.map(item=>item.name)||[]})),status:referenceOk&&mutantsOk?'passed':'failed'});
  console.log(`${id}: reference ${reference.passed}/${reference.total}; mutants ${mutantRuns.map(([name,result])=>`${name} ${result.passed}/${result.total}`).join(', ')||'none'}`);
  if(!referenceOk||!mutantsOk){failed=true;for(const item of reference.failures||[])console.log(`  REF ${item.name}: ${item.error?.stack||item.error}`);for(const [name,result] of mutantRuns)if(result.passed===result.total)console.log(`  SURVIVOR ${name}`);else for(const item of result.failures)console.log(`  ${name} ${item.name}: ${item.error?.message||item.error}`);}
}
mkdirSync('output/learning-execution',{recursive:true});
writeFileSync('output/learning-execution/task-9-reference-gates.json',JSON.stringify({generatedAt:new Date().toISOString(),scope:'contained local Node reference and semantic-mutant checks only; actual submitted-source/browser proof is separately recorded',results:evidence,executed},null,2)+'\n');
if(failed)process.exitCode=1;
else console.log(`Reference gate passed for ${executed} executable assessment(s); local/rubric/type-only cases were reported separately.`);
