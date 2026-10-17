import assert from 'node:assert/strict';
import test from 'node:test';
import {existsSync,readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {classify} from '../course-src/phase7/libraries/scripts/result.mjs';
import vm from 'node:vm';
import * as processTools from '../course-src/phase7/libraries/scripts/process.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
test('24.04 has an independent pack/consumer fixture',()=>{
  const map=JSON.parse(readFileSync(root+'course-src/phase7/competency-map.json','utf8'));
  assert.equal(map.status,'complete-local-curriculum');
  assert.equal(map.activities['24.04'].status,'implemented-verified-locally');
  assert.ok(existsSync(root+'course-src/phase7/libraries/package-lock.json'),'24.04 genuine lockfile required');
  assert.ok(existsSync(root+'course-src/phase7/libraries/test/release.test.mjs'),'external consumer contract required');
});
test('24.04 starter/reference and mutation gates use real tarballs',{timeout:360000},()=>{
  assert.ok(existsSync(root+'course-src/phase7/libraries/scripts/verify-fixtures.mjs'),'24.04 release gate required');
  const run=spawnSync(process.execPath,['course-src/phase7/libraries/scripts/verify-fixtures.mjs'],{cwd:root,encoding:'utf8',timeout:350000,windowsHide:true});
  assert.equal(run.error,undefined,String(run.error));assert.equal(run.status,0,run.stdout+run.stderr);
  assert.match(run.stdout,/starter: assertion-failure/);assert.match(run.stdout,/reference: passed/);assert.match(run.stdout,/mutants: 5\/5 assertion-failure/);
});
test('24.04 classifier counts only explicit assertion failures',()=>{
  const report=(failures=[],passed=1,skipped=0)=>'PHASE7_RESULT:'+JSON.stringify({passed,skipped,failures});
  assert.equal(classify({status:0,stdout:report()}),'passed');assert.equal(classify({status:1,stdout:report([{code:'ERR_ASSERTION'}],0)}),'assertion-failure');
  for(const code of ['ARTIFACT_OR_RUNNER_ERROR','TS2307','ENOENT','ERR_MODULE_NOT_FOUND','ETIMEDOUT'])assert.notEqual(classify({status:1,stdout:report([{code}],0)}),'assertion-failure');
  for(const code of ['TS1005','TS7016','TS2305','TS6053'])assert.notEqual(classify({status:1,stdout:report([{code:'ERR_ASSERTION',message:'compiler '+code}],0)}),'assertion-failure',code+' is an artifact error');
  assert.equal(classify({status:null,stdout:report([{code:'ERR_ASSERTION'}],0)}),'runner-error');assert.equal(classify({status:1,error:new Error('spawn'),stdout:report([{code:'ERR_ASSERTION'}],0)}),'runner-error');
  assert.equal(classify({status:0,stdout:report([],1,1)}),'incomplete');assert.notEqual(classify({status:0,stdout:report([],0)}),'passed');assert.notEqual(classify({status:1,stdout:'ERR_ASSERTION'}),'assertion-failure');
});
test('24.04 only the numeric legacy TS2345 is an expected breaking change',()=>{
  assert.equal(typeof processTools.expectedLegacyBreak,'function','explicit legacy compiler boundary required');
  const expected={status:2,stdout:"legacy.ts(3,73): error TS2345: Argument of type 'number' is not assignable to parameter of type '{ maximo: number; }'.\n",stderr:''};
  assert.equal(processTools.expectedLegacyBreak(expected),'expected-breaking-change');
  for(const code of ['TS1005','TS7016','TS2305','TS6053','TS2307'])assert.throws(()=>processTools.expectedLegacyBreak({...expected,stdout:'legacy.ts(3,73): error '+code+': failure\n'}),{code:'ARTIFACT_OR_RUNNER_ERROR'},code);
  for(const result of [{...expected,status:1},{...expected,error:new Error('spawn')},{...expected,signal:'SIGTERM'},{...expected,stdout:''},{...expected,stderr:'timeout'},{...expected,stdout:expected.stdout+'legacy.ts(1,1): error TS7016: failure\n'},{...expected,stdout:expected.stdout.replace('legacy.ts','main.ts')},{...expected,stdout:expected.stdout.replace("'number'","'string'")},{...expected,stdout:'TS2345'}])assert.throws(()=>processTools.expectedLegacyBreak(result),{code:'ARTIFACT_OR_RUNNER_ERROR'});
});
test('24.04 synchronized metadata and allowlist preserve honest evidence',()=>{
  const json=p=>JSON.parse(readFileSync(root+p,'utf8'));const catalog=json('public/course-catalog.json'),item=catalog.find(x=>x.id==='24.04');assert.ok(item,'24.04 catalog required');
  const checkpoint=json('course-src/local-checkpoints.json').targets.find(x=>x.id==='24.04'),assessment=json('course-src/assessments.json')['24.04'],manifest=json('course-src/starters/manifest.json')['24.04'];
  assert.equal(assessment.local.evidenceLabel,'local-declared');for(const [field,file] of [['package','package.json'],['packageLock','package-lock.json']])assert.deepEqual(checkpoint[field],json('course-src/phase7/libraries/'+file));
  assert.ok(manifest.files.every(x=>!/(?:reference|mutants|verify-fixtures|reporter|workspace|result\.mjs)/.test(x)));
  for(const file of manifest.files){const source=readFileSync(root+'course-src/phase7/libraries/'+file,'utf8').replaceAll('\r\n','\n');assert.equal(readFileSync(root+'course-src/starters/24.04/'+file,'utf8').replaceAll('\r\n','\n'),source);assert.equal(item.starterFiles.find(x=>x.path===file)?.content.trimEnd(),source.trimEnd());}
  const context=vm.createContext({});vm.runInContext(readFileSync(root+'public/local-checkpoints.js','utf8'),context);assert.deepEqual(JSON.parse(JSON.stringify(context.DevPathLocalCheckpoints.byId('24.04'))),checkpoint);
  const map=json('course-src/phase7/competency-map.json'),metadata=json('course-src/learning-metadata.json'),activity=map.activities['24.04'];assert.equal(activity.evidence,'local-declared');assert.deepEqual(activity.prerequisites,['22.06','22.08','22.09','24.01']);assert.equal(activity.practiceMinutes.calibrated,false);
  const closure=new Set();const visit=id=>{if(closure.has(id))return;closure.add(id);for(const dep of metadata[id]?.requires||[])visit(dep);};for(const id of activity.prerequisites)visit(id);assert.equal(closure.size,27);assert.deepEqual([...closure].sort(),metadata['24.04'].requires.slice().sort());assert.deepEqual([...closure].sort(),activity.prerequisiteClosure.map(x=>x.id).sort());
  for(const entry of activity.prerequisiteClosure){const chain=entry.evidence.chain;assert.equal(chain[0],'24.04');assert.equal(chain.at(-1),entry.id);for(let i=1;i<chain.length;i++)assert.ok(metadata[chain[i-1]].requires.includes(chain[i]));}
});
test('24.04 real ZIP runs exported scripts and external consumers',{timeout:210000},()=>{
  const run=spawnSync(process.execPath,['scripts/verify-phase7-libraries-export.mjs'],{cwd:root,encoding:'utf8',timeout:200000,windowsHide:true});assert.equal(run.error,undefined,String(run.error));assert.equal(run.status,0,run.stdout+run.stderr);assert.match(run.stdout,/Export starter: assertion-failure/);assert.match(run.stdout,/Export reference: passed/);assert.match(run.stdout,/learner scripts retained/);
});
