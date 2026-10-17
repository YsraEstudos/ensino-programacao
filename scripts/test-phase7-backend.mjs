import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {classify} from '../course-src/phase7/backend/scripts/result.mjs';
import vm from 'node:vm';
import {unlinkSync, writeFileSync} from 'node:fs';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const json = p => JSON.parse(readFileSync(new URL('../' + p, import.meta.url)));
test('parent owns SQLite temporary directories and verifies cleanup independently after child exit', {timeout:30000}, async () => {
  const modulePath=root+'/course-src/phase7/backend/scripts/test-workspace.mjs';
  assert.ok(existsSync(modulePath),'package needs a parent-owned test workspace runner');
  const {runNativeTests,cleanupWorkspace}=await import('../course-src/phase7/backend/scripts/test-workspace.mjs');
  const code=`import {DatabaseSync} from 'node:sqlite';import {mkdirSync,writeFileSync} from 'node:fs';import path from 'node:path';const dir=path.join(process.env.PHASE7_TEST_ROOT,'reopen');mkdirSync(dir);const db=new DatabaseSync(path.join(dir,'persist.sqlite'));db.exec('PRAGMA journal_mode=WAL;CREATE TABLE records(id);INSERT INTO records VALUES(1)');db.close();process.on('exit',()=>writeFileSync(path.join(dir,'PERSIST.SQLITE-SHM.tmp'),'controlled exit artifact'));`;
  const run=runNativeTests({cwd:root,args:['--input-type=module','-e',code]});
  assert.equal(run.result.status,0,run.result.stderr);
  assert.equal(run.cleanup.childWasStarted,true);
  assert.equal(run.cleanup.cleanupVerified,true);
  assert.equal(run.cleanup.verifiedAfterExit,true);
  assert.ok(run.cleanup.removedFiles.includes('reopen/persist.sqlite'));
  assert.ok(run.cleanup.removedFiles.includes('reopen/PERSIST.SQLITE-SHM.tmp'));
  assert.equal(existsSync(run.cleanup.root),false,'parent actually removes its root before it exits');
  let error;
  try { runNativeTests({cwd:root,args:['--input-type=module','-e',`import {writeFileSync} from 'node:fs';import path from 'node:path';writeFileSync(path.join(process.env.PHASE7_TEST_ROOT,'unrelated.txt'),'preserve');`]}); }
  catch(caught){error=caught;}
  assert.equal(error?.code,'ERR_TEST_UNKNOWN_FILE');
  assert.equal(existsSync(path.join(error.workspace,'unrelated.txt')),true,'unknown child must be preserved and fail cleanup');
  unlinkSync(path.join(error.workspace,'unrelated.txt')); // solely owned by this negative regression
  cleanupWorkspace(error.workspace);
  const timed=runNativeTests({cwd:root,args:['--input-type=module','-e','setInterval(()=>{},1000)'],timeout:50});
  assert.equal(classify(timed.result),'runner-error','cleanup success cannot promote a timed-out native process');
  assert.equal(timed.cleanup.childWasStarted,true);
  assert.equal(timed.cleanup.cleanupVerified,true);
  assert.equal(timed.cleanup.verifiedAfterExit,true);
  const missingNode=path.join(root,'node-not-installed-for-cleanup-regression');
  assert.equal(existsSync(missingNode),false);
  const notStarted=runNativeTests({cwd:root,node:missingNode});
  assert.equal(notStarted.cleanup.childWasStarted,false);
  assert.equal(notStarted.cleanup.verifiedAfterExit,false,'no child exit can be proved when spawn never started a child');
  assert.equal(notStarted.cleanup.cleanupVerified,true,'parent cleanup can succeed independently of a spawn failure');
  assert.equal(notStarted.result.status,null,'the native spawn failure remains intact');
  assert.equal(notStarted.result.error?.code,'ENOENT');
  assert.equal(classify(notStarted.result),'runner-error');
  assert.equal(existsSync(notStarted.cleanup.root),false,'parent still removes the unused workspace');
});
test('backend classifier never calls environmental, skipped or unrecognized results assertion failures', () => {
  const report = failures => 'PHASE7_RESULT:' + JSON.stringify({passed: 0, skipped: 0, failures});
  assert.equal(classify({status: 1, stdout: report([{code: 'ERR_ASSERTION'}])}), 'assertion-failure');
  for (const code of ['EACCES','ENOENT','ENOTEMPTY','ERR_TEST_DATABASE_OPEN','ERR_TEST_SQLITE_SIDECAR','ERR_MODULE_NOT_FOUND','ERR_TEST_FAILURE','SyntaxError','ETIMEDOUT']) {
    assert.notEqual(classify({status: 1, stdout: report([{code}])}), 'assertion-failure');
  }
  assert.notEqual(classify({status:1,stdout:report([{code:'ERR_TEST_FAILURE',causeCode:'ENOTEMPTY',message:'failed running after hook'}])}),'assertion-failure');
  for (const status of [2,127,null]) assert.notEqual(classify({status, stdout: report([{code:'ERR_ASSERTION'}])}), 'assertion-failure');
  assert.equal(classify({status: 1, error: new Error('spawn EACCES'), stdout: report([{code:'ERR_ASSERTION'}])}), 'runner-error');
  assert.equal(classify({status: 1, signal: 'SIGTERM', stdout: report([{code:'ERR_ASSERTION'}])}), 'runner-error');
  assert.equal(classify({status: 0, stdout: 'PHASE7_RESULT:{"passed":7,"skipped":1,"failures":[]}'}), 'incomplete');
});
test('24.02 has a complete local export and schema/HTTP/SQLite contract', () => {
  assert.ok(existsSync(root + '/course-src/phase7/backend/package-lock.json'), '24.02 lockfile and fixture are required');
  const item = json('public/course-catalog.json').find(x => x.id === '24.02');
  assert.ok(item, '24.02 catalog');
  const cp = json('course-src/local-checkpoints.json').targets.find(x => x.id === '24.02');
  assert.deepEqual(cp.package, json('course-src/phase7/backend/package.json'));
  assert.deepEqual(cp.packageLock, json('course-src/phase7/backend/package-lock.json'));
  assert.equal(json('course-src/assessments.json')['24.02'].local.evidenceLabel, 'local-declared');
  assert.equal(cp.package.engines.node, '>=24.15.0');
  const manifest = json('course-src/starters/manifest.json')['24.02'];
  assert.ok(manifest.files.includes('test/contract.test.mjs'));
  assert.ok(manifest.files.every(p => !/reference|mutants|verify-fixtures/.test(p)));
  for (const relative of manifest.files) {
    const fixture = readFileSync(root+'/course-src/phase7/backend/'+relative,'utf8').replaceAll('\r\n','\n');
    assert.equal(readFileSync(root+'/course-src/starters/24.02/'+relative,'utf8').replaceAll('\r\n','\n'),fixture,relative+' fixture/starter drift');
    assert.equal(item.starterFiles.find(f=>f.path===relative)?.content?.trimEnd(),fixture.trimEnd(),relative+' public catalog drift');
  }
  const context=vm.createContext({});vm.runInContext(readFileSync(root+'/public/local-checkpoints.js','utf8'),context);
  const published=JSON.parse(JSON.stringify(context.DevPathLocalCheckpoints.byId('24.02')));
  assert.deepEqual(published,cp,'public checkpoint drift');
  const map = json('course-src/phase7/competency-map.json').activities['24.02'];
  assert.equal(map.evidence, 'local-declared');
  assert.ok(map.prerequisites.includes('22.06'));
  const metadata=json('course-src/learning-metadata.json');
  const closure=new Set();
  const visit=id=>{if(closure.has(id))return;closure.add(id);for(const dependency of metadata[id]?.requires||[])visit(dependency);};
  for(const id of map.prerequisites)visit(id);
  assert.deepEqual([...closure].sort(),[...metadata['24.02'].requires].sort());
  assert.deepEqual(map.prerequisiteClosure.map(x=>x.id).sort(),[...closure].sort());
  for(const entry of map.prerequisiteClosure){
    assert.equal(entry.evidence.chain[0],'24.02');
    assert.equal(entry.evidence.chain.at(-1),entry.id);
    for(let i=1;i<entry.evidence.chain.length;i++) assert.ok(metadata[entry.evidence.chain[i-1]].requires.includes(entry.evidence.chain[i]));
  }
});
test('24.02 reference, starter and representative mutants run in temporary copies', {timeout: 180000}, () => {
  const run = spawnSync(process.execPath, ['course-src/phase7/backend/scripts/verify-fixtures.mjs'], {cwd: root, encoding: 'utf8', timeout: 170000});
  assert.equal(run.error, undefined, String(run.error));
  assert.equal(run.status, 0, run.stdout + run.stderr);
  assert.match(run.stdout, /starter: assertion-failure/);
  assert.match(run.stdout, /reference: passed/);
  assert.match(run.stdout, /mutants: 4\/4 assertion-failure/);
});
test('24.02 actual ZIP extracts, excludes answers and runs the student contract in a temporary project', {timeout: 90000}, () => {
  const run=spawnSync(process.execPath,['scripts/verify-phase7-backend-export.mjs'],{cwd:root,encoding:'utf8',timeout:85000});
  assert.equal(run.error,undefined,String(run.error));
  assert.equal(run.status,0,run.stdout+run.stderr);
  assert.match(run.stdout,/Export starter: assertion-failure/);
  assert.match(run.stdout,/Export reference: 7\/7 passed/);
});
