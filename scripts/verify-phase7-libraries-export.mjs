import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,mkdirSync,writeFileSync,cpSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {fixture,npm,build,contracts,reference,success} from '../course-src/phase7/libraries/scripts/workspace.mjs';
await import('../public/course-project-export.js');
const root=fileURLToPath(new URL('../',import.meta.url)),json=p=>JSON.parse(readFileSync(path.join(root,p),'utf8'));
const item=json('public/course-catalog.json').find(x=>x.id==='24.04'),assessment=json('course-src/assessments.json')['24.04'],checkpoint=json('course-src/local-checkpoints.json').targets.find(x=>x.id==='24.04'),manifest=json('course-src/starters/manifest.json')['24.04'];
assert.ok(item&&assessment&&checkpoint&&manifest,'Review and synchronized24.04 required before export gate');
const directory=mkdtempSync(path.join(tmpdir(),'p7-library-zip-')),project=path.join(directory,'project');mkdirSync(project);
try{
  const exported=await globalThis.DevPathCourseProjectExport.downloadProject({item,files:item.starterFiles,assessment,checkpoint},{triggerDownload:false});
  const bytes=Buffer.from(await exported.blob.arrayBuffer());writeFileSync(path.join(directory,'24.04.zip'),bytes);const paths=[];let offset=0;
  while(offset+30<=bytes.length&&bytes.readUInt32LE(offset)===0x04034b50){
    assert.equal(bytes.readUInt16LE(offset+8),0);const length=bytes.readUInt32LE(offset+18),names=bytes.readUInt16LE(offset+26),extra=bytes.readUInt16LE(offset+28),name=bytes.subarray(offset+30,offset+30+names).toString('utf8');
    assert.equal(globalThis.DevPathCourseProjectExport.normalizeProjectPath(name),name);const start=offset+30+names+extra,target=path.join(project,name);mkdirSync(path.dirname(target),{recursive:true});writeFileSync(target,bytes.subarray(start,start+length));paths.push(name);offset=start+length;
  }
  assert.deepEqual(paths.sort(),[...manifest.files,'devpath-project.json'].sort());assert.ok(paths.every(name=>!/(?:reference|mutants|verify-fixtures|workspace\.mjs|result\.mjs|reporter\.mjs)/.test(name)));
  for(const file of ['scripts/process.mjs','scripts/pack.mjs','test/release.test.mjs'])assert.ok(paths.includes(file),'learner-required script '+file);
  for(const file of ['package.json','package-lock.json'])assert.deepEqual(JSON.parse(readFileSync(path.join(project,file))),json('course-src/phase7/libraries/'+file));
  assert.equal(JSON.parse(readFileSync(path.join(project,'devpath-project.json'))).evidenceSource,'local-declared');
  if(process.argv.includes('--install'))success(npm(project,['ci','--ignore-scripts','--offline','--no-audit','--no-fund','--cache',process.env.P7_NPM_CACHE||'C:/Users/israe/AppData/Local/npm-cache']),'export clean npm ci');
  else cpSync(path.join(fixture,'node_modules'),path.join(project,'node_modules'),{recursive:true});
  build(project);contracts(project,'Export starter','assertion-failure');reference(project);build(project);contracts(project,'Export reference','passed');
  success(npm(project,['test']),'export declared npm test');success(npm(project,['run','pack:releases']),'export declared pack:releases');
  console.log('ZIP real: '+paths.length+' files; answers/internal gates excluded; learner scripts retained; npm test/pack:releases passed. Evidence local-declared.');
}finally{assert.equal(path.dirname(path.resolve(directory)),path.resolve(tmpdir()));assert.match(path.basename(directory),/^p7-library-zip-/);rmSync(directory,{recursive:true,force:true});}
