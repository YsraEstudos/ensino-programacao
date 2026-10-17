import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,mkdirSync,writeFileSync,cpSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {fixture,node,npm,build,contracts,browser,reference} from '../course-src/phase7/frontend/scripts/workspace.mjs';
await import('../public/course-project-export.js');
const root=fileURLToPath(new URL('../',import.meta.url)),json=p=>JSON.parse(readFileSync(path.join(root,p),'utf8'));
const item=json('public/course-catalog.json').find(x=>x.id==='24.03'),assessment=json('course-src/assessments.json')['24.03'],checkpoint=json('course-src/local-checkpoints.json').targets.find(x=>x.id==='24.03'),manifest=json('course-src/starters/manifest.json')['24.03'];
const directory=mkdtempSync(path.join(tmpdir(),'p7-front-zip-')),project=path.join(directory,'project');mkdirSync(project);
try{
  const exported=await globalThis.DevPathCourseProjectExport.downloadProject({item,files:item.starterFiles,assessment,checkpoint},{triggerDownload:false});
  const bytes=Buffer.from(await exported.blob.arrayBuffer());writeFileSync(path.join(directory,'24.03.zip'),bytes);
  const paths=[];let offset=0;
  while(offset+30<=bytes.length&&bytes.readUInt32LE(offset)===0x04034b50){
    assert.equal(bytes.readUInt16LE(offset+8),0);const length=bytes.readUInt32LE(offset+18),names=bytes.readUInt16LE(offset+26),extra=bytes.readUInt16LE(offset+28),name=bytes.subarray(offset+30,offset+30+names).toString('utf8');
    assert.equal(globalThis.DevPathCourseProjectExport.normalizeProjectPath(name),name);const start=offset+30+names+extra,target=path.join(project,name);mkdirSync(path.dirname(target),{recursive:true});writeFileSync(target,bytes.subarray(start,start+length));paths.push(name);offset=start+length;
  }
  assert.deepEqual(paths.sort(),[...manifest.files,'devpath-project.json'].sort());assert.ok(paths.every(name=>!/(?:reference|mutants|scripts\/|reporter)/.test(name)));
  for(const file of ['package.json','package-lock.json'])assert.deepEqual(JSON.parse(readFileSync(path.join(project,file))),json('course-src/phase7/frontend/'+file));
  assert.equal(JSON.parse(readFileSync(path.join(project,'devpath-project.json'))).evidenceSource,'local-declared');
  console.log(`ZIP real: ${paths.length} files; fixture manifests preserved; answers/internal scripts excluded.`);
  if(process.argv.includes('--install')){
    const install=npm(project,['ci','--ignore-scripts','--no-audit','--no-fund','--fetch-retries=0','--fetch-timeout=15000']);assert.equal(install.error,undefined,String(install.error));assert.equal(install.status,0,install.stdout+install.stderr);console.log('Clean npm ci: passed. '+install.stdout.trim());
  }else cpSync(path.join(fixture,'node_modules'),path.join(project,'node_modules'),{recursive:true});
  build(project);const types=npm(project,['run','test:types']);assert.equal(types.status,0,types.stdout+types.stderr);
  contracts(project,'Export starter','assertion-failure');const red=npm(project,['test']);assert.equal(red.error,undefined,String(red.error));assert.equal(red.status,1,red.stdout+red.stderr);assert.match(red.stdout+red.stderr,/ERR_ASSERTION/);
  reference(project);contracts(project,'Export reference','passed');const green=npm(project,['test']);assert.equal(green.error,undefined,String(green.error));assert.equal(green.status,0,green.stdout+green.stderr);
  browser(project,'Export reference E2E');console.log(`Export reference: 8/8 native and 7/7 Chromium passed; declared npm test red/green; ${node}. Evidence local-declared.`);
}finally{assert.equal(path.dirname(path.resolve(directory)),path.resolve(tmpdir()));assert.match(path.basename(directory),/^p7-front-zip-/);rmSync(directory,{recursive:true,force:true});}
