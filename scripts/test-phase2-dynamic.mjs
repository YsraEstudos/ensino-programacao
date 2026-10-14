import {after, test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import * as esbuild from 'esbuild-wasm';
import {parse} from 'acorn';
import {JSDOM} from 'jsdom';
import {setup} from './course-runner-harness.mjs';
import {checkTypes} from './typecheck-entry.mjs';
const ids=['16.01','17.02','18.02','19.01','19.02','19.06'];
const assessments=JSON.parse(readFileSync('course-src/assessments.json','utf8'));
const publishedAssessments=JSON.parse(readFileSync('public/course-assessments.json','utf8'));
const manifest=JSON.parse(readFileSync('course-src/starters/manifest.json','utf8'));
const read=(p)=>readFileSync('course-src/'+p,'utf8');
const libraries={};
for(const name of readdirSync('node_modules/typescript/lib').filter(name=>/^lib\..+\.d\.ts$/.test(name))){const value=readFileSync(path.join('node_modules/typescript/lib',name),'utf8');libraries['/node_modules/typescript/lib/'+name]=value;libraries['/'+name]=value;}
function check(id,source){const a=assessments[id],contract=a.contractTypeFiles[0];return checkTypes({files:[{path:a.entryPath,content:source},{path:contract.path,content:contract.content}],entryPaths:[a.entryPath,contract.path],tsconfigPath:a.tsconfigPath},{libraries});}
function directoryFiles(directory,base=directory){return readdirSync('course-src/'+directory,{withFileTypes:true}).flatMap(entry=>{const path=directory+'/'+entry.name;return entry.isDirectory()?directoryFiles(path,base):[{path:path.slice(base.length+1),content:read(path)}];});}
const graphWindow={TextEncoder};graphWindow.window=graphWindow;vm.runInThisContext('(function(window){'+readFileSync('public/module-graph.js','utf8')+'})')(graphWindow);
const graphApi=graphWindow.DevPathModuleGraph;
for(const id of ids){
 test(id+' protected type contract accepts the reference and rejects the learner starter',()=>{
   const a=assessments[id],entry=manifest[id].files[0];
   const reference=check(id,read(a.referenceDir+'/'+entry));
   assert.equal(reference.supported,true,JSON.stringify(reference.diagnostics));
   assert.equal(reference.diagnostics.some(d=>d.category==='error'),false,JSON.stringify(reference.diagnostics));
   const starter=check(id,read('starters/'+id+'/'+entry));
   assert.equal(starter.supported,true,JSON.stringify(starter.diagnostics));
   assert(starter.diagnostics.some(d=>d.category==='error'),JSON.stringify(starter.diagnostics));
 });
 if(assessments[id].typeContractMutants?.length){
  test(id+' internal control mutant is rejected by protected assertions',()=>{
    const a=assessments[id],mutant=a.typeContractMutants[0];
    const source=checkTypes({files:[...mutant.files,...a.contractTypeFiles],entryPaths:[a.entryPath,...a.contractTypeFiles.map(f=>f.path)]},{libraries});
    assert.equal(source.supported,true,JSON.stringify(source.diagnostics));
    assert(source.diagnostics.some(d=>d.category==='error'),JSON.stringify(source.diagnostics));
    assert(source.diagnostics.some(d=>d.category==='error'&&[2322,2344,2345,2349,2353,2367,2578,2769].includes(Number(d.code))),JSON.stringify(source.diagnostics));
  });
 }
}

test('18.02 inlined protected behavior resolves patch.ts from its synthetic root and executes the real suite',async()=>{
 const a=assessments['18.02'];
 assert.equal(a.behaviorTestPath,'__devpath_protected_behavior__.js');
 const behavior=read(a.testPath);
 assert.match(behavior,/from '\.\/patch\.js'/);
 const files=[{path:'patch.ts',content:read(a.referenceDir+'/'+a.entryPath)},{path:a.behaviorTestPath,content:behavior}];
 const graph=await graphApi.buildModuleGraph({files,entryPath:a.behaviorTestPath,assertionCases:publishedAssessments['18.02'].assertionCases},{build:esbuild.build,parse,transform:esbuild.transform});
 vm.runInThisContext(readFileSync('public/course-test-runtime.js','utf8'));
 const runtime=globalThis.DevPathTestRuntime.createTestRuntime({target:globalThis});
 const restore=runtime.install(globalThis);
 try {
  await import('data:text/javascript;base64,'+Buffer.from(graph.code).toString('base64'));
  const result=await runtime.run();
  assert.equal(result.failed,0,result.text);
  assert.equal(result.total,1,'the protected behavior assertion executed against patch.ts');
 } finally {restore();delete globalThis.DevPathTestRuntime;}
});

test('all converted JavaScript references pass their protected suites in a local DOM-capable harness',async()=>{
 const ids=['11.01','11.02','11.11','11.14','12.02','12.11','12.14','13.02','14.02'];
 const keys=['window','document','Node','MouseEvent','WheelEvent','AbortController','Response','Headers','DOMException'];
 const previous=new Map(keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost'});
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,Node:dom.window.Node,MouseEvent:dom.window.MouseEvent,WheelEvent:dom.window.WheelEvent,AbortController:dom.window.AbortController});
 vm.runInThisContext(readFileSync('public/course-test-runtime.js','utf8'));
 try {
  for(const id of ids){
   const assessment=assessments[id],referenceFiles=directoryFiles(assessment.referenceDir).filter(file=>/\.(?:m?js|jsx|ts|tsx|json)$/i.test(file.path)).map(file=>({path:'tests/'+file.path.split('/').pop(),content:file.content})),files=[...referenceFiles,{path:assessment.testPath,content:read(assessment.testPath)}];
   const graph=await graphApi.buildModuleGraph({files,entryPath:assessment.testPath,assertionCases:publishedAssessments[id]?.assertionCases||[]},{build:esbuild.build,parse,transform:esbuild.transform});
   const runtime=globalThis.DevPathTestRuntime.createTestRuntime({target:globalThis});
   const restore=runtime.install(globalThis);
   try {
    await import('data:text/javascript;base64,'+Buffer.from(graph.code).toString('base64'));
    const result=await runtime.run();
    assert.equal(result.failed,0,`${id}: ${result.text}`);assert(result.total>0,`${id} runs at least one protected test`);
   } finally {restore();}
  }
 } finally {
  delete globalThis.DevPathTestRuntime;dom.window.close();
  for(const [key,descriptor] of previous){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
 }
});

const predictionRunner=setup();
try {
 const providerWindow={};vm.runInNewContext(readFileSync('public/structured-predictions.js','utf8'),{window:providerWindow});
 const provider=providerWindow.DevPathStructuredPredictions;
 const tables=JSON.parse(readFileSync('course-src/predictions.json','utf8'));
 test('older freeform predictions and incomplete structured predictions stay preserved',()=>{
   const table={version:1,fields:[{id:'first',label:'First'},{id:'second',label:'Second'}]};
   const legacy='Minha previsão anterior';
   const old=provider.parse(legacy,table);
   assert.equal(old.state,'legacy');assert.equal(old.compatible,false);
   assert.match(provider.renderSaved(table,legacy),/Minha previsão anterior/);
   const partial=JSON.stringify({version:1,answers:{first:'A'}});
   const parsed=provider.parse(partial,table);
   assert.equal(parsed.state,'current');assert.equal(parsed.compatible,true);
   assert.match(provider.renderSaved(table,partial),/>A</);assert.match(provider.renderSaved(table,partial),/Second/);
   const comparison=provider.compare(table,partial,'{"first":"A","second":"B"}');
   assert.deepEqual({matched:comparison.matched,answered:comparison.answered,total:comparison.total,complete:comparison.complete},{matched:1,answered:1,total:2,complete:false});
 });
 for(const [id,expected] of [['12.01','A,B,P,T'],['12.04','A,B,P1,Q,P2,T']]) test(id+' timer demonstration emits and compares the observed log order',async()=>{
   const source=readFileSync('course-src/starters/'+id+'/main.js','utf8');
   const files=[{path:'main.js',content:source},{path:'__devpath_prediction_demo__.js',content:'import "./main.js";\nawait new Promise(resolve => setTimeout(resolve, 0));'}];
   const graph=await graphApi.buildModuleGraph({files,entryPath:'__devpath_prediction_demo__.js'},{build:esbuild.build,parse,transform:esbuild.transform});
   const observed=await new Promise(resolve=>predictionRunner.w.DevPathCourseRunner.run({module:graph.code},(kind,text,tests)=>resolve({kind,text,tests}),{timeoutMs:2000}));
   assert.equal(observed.kind,'result',observed.text);assert.equal(observed.tests,undefined,'a prediction demonstration is not an automatic test result');
   const table=tables[id].cases[0];assert.equal(table.outputFormat,'lines');
   const saved=provider.serialize(table,{order:expected});const comparison=provider.compare(table,saved,observed.text);
   assert.deepEqual(observed.text.split(/\r?\n/),expected.split(','),observed.text);assert.equal(comparison.matched,1,JSON.stringify(comparison));
 });
} finally { await predictionRunner.close(); }
after(() => esbuild.stop());
