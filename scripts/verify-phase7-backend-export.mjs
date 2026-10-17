import assert from 'node:assert/strict';
import {readFileSync, mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {classify} from '../course-src/phase7/backend/scripts/result.mjs';
import {runNativeTests} from '../course-src/phase7/backend/scripts/test-workspace.mjs';
await import('../public/course-project-export.js');
const root=fileURLToPath(new URL('../',import.meta.url));
const json=p=>JSON.parse(readFileSync(path.join(root,p),'utf8'));
const item=json('public/course-catalog.json').find(x=>x.id==='24.02');
const assessment=json('course-src/assessments.json')['24.02'];
const checkpoint=json('course-src/local-checkpoints.json').targets.find(x=>x.id==='24.02');
const fixture=path.join(root,'course-src/phase7/backend');
const manifest=json('course-src/starters/manifest.json')['24.02'];
const directory=mkdtempSync(path.join(tmpdir(),'p7-zip-'));
const project=path.join(directory,'project');mkdirSync(project);
const node=process.env.DEVPATH_NODE || process.execPath;
const env={...process.env};delete env.NODE_TEST_CONTEXT;
const pathKey=Object.keys(env).find(key=>key.toLowerCase()==='path')||'PATH';
env[pathKey]=path.dirname(node)+path.delimiter+(env[pathKey]||'');
const run=(args)=>spawnSync(node,args,{cwd:project,env,encoding:'utf8',timeout:40000,windowsHide:true});
const npm=(command)=>process.platform==='win32'
  ? spawnSync(process.env.ComSpec||'cmd.exe',['/d','/s','/c',`npm ${command}`],{cwd:project,env,encoding:'utf8',timeout:45000,windowsHide:true})
  : spawnSync('npm',command.split(' '),{cwd:project,env,encoding:'utf8',timeout:45000});
try{
  const exported=await globalThis.DevPathCourseProjectExport.downloadProject({item,files:item.starterFiles,assessment,checkpoint},{triggerDownload:false});
  const bytes=Buffer.from(await exported.blob.arrayBuffer());
  writeFileSync(path.join(directory,'24.02.zip'),bytes);
  const paths=[];let offset=0;
  while(offset+30<=bytes.length&&bytes.readUInt32LE(offset)===0x04034b50){
    assert.equal(bytes.readUInt16LE(offset+8),0,'real exporter ZIP uses stored entries');
    const length=bytes.readUInt32LE(offset+18),names=bytes.readUInt16LE(offset+26),extra=bytes.readUInt16LE(offset+28);
    const name=bytes.subarray(offset+30,offset+30+names).toString('utf8');
    assert.equal(globalThis.DevPathCourseProjectExport.normalizeProjectPath(name),name);
    const start=offset+30+names+extra,target=path.join(project,name);
    mkdirSync(path.dirname(target),{recursive:true});writeFileSync(target,bytes.subarray(start,start+length));
    paths.push(name);offset=start+length;
  }
  assert.deepEqual(paths.sort(),[...manifest.files,'devpath-project.json'].sort());
  assert.ok(paths.every(name=>!/reference|mutants|verify-fixtures|reporter|result\.mjs/.test(name)));
  assert.deepEqual(json('course-src/phase7/backend/package.json'),JSON.parse(readFileSync(path.join(project,'package.json'))));
  assert.deepEqual(json('course-src/phase7/backend/package-lock.json'),JSON.parse(readFileSync(path.join(project,'package-lock.json'))));
  assert.equal(JSON.parse(readFileSync(path.join(project,'devpath-project.json'))).evidenceSource,'local-declared');
  console.log(`ZIP real: ${paths.length} files, package/lock preserved, internal answers excluded.`);
  if(process.argv.includes('--install')){
    const install=npm('ci --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=10000');
    assert.equal(install.error,undefined,String(install.error));assert.equal(install.status,0,install.stdout+install.stderr);
    console.log(`Clean npm ci: passed. ${install.stdout.trim()}`);
  }else cpSync(path.join(fixture,'node_modules'),path.join(project,'node_modules'),{recursive:true});
  const build=run(['scripts/check.mjs']);assert.equal(build.status,0,build.stdout+build.stderr);
  const strictRun=()=>runNativeTests({cwd:project,node,reporter:pathToFileURL(path.join(fixture,'scripts/reporter.mjs')).href});
  const {result:starter,cleanup:starterCleanup}=strictRun();assert.equal(classify(starter,7),'assertion-failure',starter.stdout+starter.stderr);
  assert.equal(starterCleanup.verifiedAfterExit,true,'starter cleanup is an independent parent obligation');
  const npmStarter=npm('test');assert.equal(npmStarter.error,undefined,String(npmStarter.error));assert.equal(npmStarter.status,1,npmStarter.stdout+npmStarter.stderr);
  assert.match(npmStarter.stdout+npmStarter.stderr,/ERR_ASSERTION/);
  console.log(`Export starter: assertion-failure (${node}).`);
  for(const file of ['service.mjs','store.mjs','schema.mjs','hono.mjs'])cpSync(path.join(fixture,'reference',file),path.join(project,'src',file));
  cpSync(path.join(fixture,'reference/report.mjs'),path.join(project,'maintenance/report.mjs'));
  const {result:reference,cleanup:referenceCleanup}=strictRun();assert.equal(classify(reference,7),'passed',reference.stdout+reference.stderr);
  assert.equal(referenceCleanup.verifiedAfterExit,true,'reference cleanup is independent of native green');
  const npmReference=npm('test');assert.equal(npmReference.error,undefined,String(npmReference.error));assert.equal(npmReference.status,0,npmReference.stdout+npmReference.stderr);
  console.log('Declared npm test: starter red and reference green; same seven contracts.');
  console.log('Export parent cleanup: passed after each native child exit; independent of test outcome.');
  console.log('Export reference: 7/7 passed against real HTTP/SQLite; no skips. Evidence local-declared.');
}finally{
  assert.equal(path.dirname(path.resolve(directory)),path.resolve(tmpdir()));
  assert.match(path.basename(directory),/^p7-zip-/);
  rmSync(directory,{recursive:true,force:true});
}
