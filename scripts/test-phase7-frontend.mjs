import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';
import {classify} from '../course-src/phase7/frontend/scripts/result.mjs';
import BrowserReporter from '../course-src/phase7/frontend/scripts/browser-reporter.mjs';
import test from 'node:test';
const root=fileURLToPath(new URL('../',import.meta.url));
test('24.03 exports an honest local frontend checkpoint',()=>{
  assert.ok(existsSync(root+'/course-src/phase7/frontend/package-lock.json'),'frontend fixture and genuine lockfile required');
  const catalog=JSON.parse(readFileSync(root+'/public/course-catalog.json'));
  const item=catalog.find(x=>x.id==='24.03');assert.ok(item,'24.03 catalog required');
  const json=p=>JSON.parse(readFileSync(root+'/'+p));
  const checkpoint=json('course-src/local-checkpoints.json').targets.find(x=>x.id==='24.03'),assessment=json('course-src/assessments.json')['24.03'];
  assert.equal(assessment.local.evidenceLabel,'local-declared');assert.equal(checkpoint.package.engines.node,'>=24.0.0');
  for(const [field,file] of [['package','package.json'],['packageLock','package-lock.json']])assert.deepEqual(checkpoint[field],json('course-src/phase7/frontend/'+file));
  const manifest=json('course-src/starters/manifest.json')['24.03'];assert.ok(manifest.files.includes('e2e/kanban.spec.mjs'));assert.ok(manifest.files.includes('src/storage.mjs'));
  assert.ok(manifest.files.every(file=>!/reference|mutants|scripts\//.test(file)));
  for(const file of manifest.files){const source=readFileSync(root+'/course-src/phase7/frontend/'+file,'utf8').replaceAll('\r\n','\n');assert.equal(readFileSync(root+'/course-src/starters/24.03/'+file,'utf8').replaceAll('\r\n','\n'),source,file+' starter drift');assert.equal(item.starterFiles.find(x=>x.path===file)?.content.trimEnd(),source.trimEnd(),file+' catalog drift');}
  const context=vm.createContext({});vm.runInContext(readFileSync(root+'/public/local-checkpoints.js','utf8'),context);assert.deepEqual(JSON.parse(JSON.stringify(context.DevPathLocalCheckpoints.byId('24.03'))),checkpoint);
  const map=json('course-src/phase7/competency-map.json'),metadata=json('course-src/learning-metadata.json'),activity=map.activities['24.03'];assert.equal(activity.evidence,'local-declared');assert.equal(map.status,'complete-local-curriculum');assert.equal(activity.status,'implemented-verified-locally');assert.ok(activity.limits.some(limit=>/Real Site navigation\/export and account resume\/sync homologation pending/.test(limit)));
  const closure=new Set();const visit=id=>{if(closure.has(id))return;closure.add(id);for(const dep of metadata[id]?.requires||[])visit(dep);};for(const id of activity.prerequisites)visit(id);
  assert.deepEqual([...closure].sort(),metadata['24.03'].requires.slice().sort());assert.deepEqual([...closure].sort(),activity.prerequisiteClosure.map(x=>x.id).sort());
  for(const entry of activity.prerequisiteClosure){const chain=entry.evidence.chain;assert.equal(chain[0],'24.03');assert.equal(chain.at(-1),entry.id);for(let i=1;i<chain.length;i++)assert.ok(metadata[chain[i-1]].requires.includes(chain[i]));}
});
test('frontend classifier rejects process/module/timeout/skip and malformed reports',()=>{
  const report=(failures=[],passed=8,skipped=0)=>'PHASE7_RESULT:'+JSON.stringify({passed,skipped,failures});
  assert.equal(classify({status:0,stdout:report()},8),'passed');assert.equal(classify({status:1,stdout:report([{code:'ERR_ASSERTION'}])}),'assertion-failure');
  for(const code of ['EACCES','ENOENT','ERR_MODULE_NOT_FOUND','SyntaxError','ETIMEDOUT','BROWSER_OR_CONTRACT_ERROR'])assert.notEqual(classify({status:1,stdout:report([{code}])}),'assertion-failure');
  for(const status of [2,127,null])assert.notEqual(classify({status,stdout:report([{code:'ERR_ASSERTION'}])}),'assertion-failure');
  for(const extra of [{error:new Error('spawn')},{signal:'SIGTERM'}])assert.equal(classify({status:1,stdout:report([{code:'ERR_ASSERTION'}]),...extra}),'runner-error');
  assert.equal(classify({status:0,stdout:report([],8,1)}),'incomplete');assert.equal(classify({status:1,stdout:'ERR_ASSERTION'}),'unrecognized-error');assert.notEqual(classify({status:0,stdout:report([],0)},3),'passed');
});
test('browser reporter accepts only explicitly identified native assertion; never timeout or missing browser',()=>{
  const classifyError=(message,status='failed')=>{const reporter=new BrowserReporter();reporter.onTestEnd({},{status,errors:[{message}]});return reporter.report.failures[0]?.code;};
  assert.equal(classifyError('AssertionError: PHASE7_ASSERTION[ERR_ASSERTION] values differ'),'ERR_ASSERTION');
  for(const message of ['AssertionError: values differ','TimeoutError: expect failed','browserType.launch missing executable','ERR_MODULE_NOT_FOUND','ENOENT','EACCES','PHASE7_ASSERTION[ERR_ASSERTION] TimeoutError'])assert.notEqual(classifyError(message),'ERR_ASSERTION');
  assert.notEqual(classifyError('PHASE7_ASSERTION[ERR_ASSERTION] values differ','timedOut'),'ERR_ASSERTION');
});
test('24.03 reference/starter and five mutants execute real HTTP and Chromium', {timeout:200000},()=>{
  const run=spawnSync(process.execPath,['course-src/phase7/frontend/scripts/verify-fixtures.mjs'],{cwd:root,encoding:'utf8',timeout:190000,windowsHide:true});
  assert.equal(run.error,undefined,String(run.error));assert.equal(run.status,0,run.stdout+run.stderr);assert.match(run.stdout,/starter: assertion-failure/);assert.match(run.stdout,/reference E2E: passed; browser executed/);assert.match(run.stdout,/mutants: 5\/5 assertion-failure/);
});
test('24.03 real ZIP excludes answers and runs extracted native / Chromium contracts', {timeout:140000},()=>{
  const run=spawnSync(process.execPath,['scripts/verify-phase7-frontend-export.mjs'],{cwd:root,encoding:'utf8',timeout:130000,windowsHide:true});
  assert.equal(run.error,undefined,String(run.error));assert.equal(run.status,0,run.stdout+run.stderr);assert.match(run.stdout,/Export starter: assertion-failure/);assert.match(run.stdout,/Export reference: 8\/8 native and 7\/7 Chromium passed/);
});
