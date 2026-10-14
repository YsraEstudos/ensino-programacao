import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {cp,mkdtemp,readFile,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import {checkTypes} from './typecheck-entry.mjs';

const assessment=JSON.parse(readFileSync('course-src/assessments.json','utf8'))['22.07'];
const suite=readFileSync('course-src/solutions/22.07/tipos.test.ts','utf8');
const libraries={};
for(const name of readdirSync('node_modules/typescript/lib').filter(name=>/^lib\..+\.d\.ts$/.test(name))){
  const content=readFileSync(path.join('node_modules/typescript/lib',name),'utf8');
  libraries[`/node_modules/typescript/lib/${name}`]=content;
  libraries[`/${name}`]=content;
}
const config={path:'tsconfig.json',content:JSON.stringify({compilerOptions:{strict:true,noEmit:true,target:'ES2022',module:'ESNext',moduleResolution:'Bundler',lib:['ES2022']},files:['tipos.test.ts']})};
const check=declaration=>checkTypes({files:[{path:'tipos.test.ts',content:suite},{path:'index.d.ts',content:declaration},config],entryPaths:['tipos.test.ts'],tsconfigPath:'tsconfig.json'},{libraries});
const reference=assessment.correctFiles.find(file=>file.path==='index.d.ts').content;

test('22.07 authored type suite compiles against correct declaration',()=>{
  const result=check(reference);
  assert.equal(result.supported,true);
  assert.deepEqual(result.diagnostics.filter(d=>d.category==='error'),[]);
});

for(const mutant of assessment.mutantDirs){
  test(`22.07 semantic declaration mutant is rejected: ${mutant.id}`,()=>{
    const result=check(mutant.files[0].content);
    assert.equal(result.supported,true,JSON.stringify(result.diagnostics));
    assert.equal(result.diagnostics.some(d=>d.category==='error'&&d.file==='tipos.test.ts'&&[2322,2344,2345,2349,2353,2367,2578,2769].includes(Number(d.code))),true,JSON.stringify(result.diagnostics));
    assert.equal(result.diagnostics.some(d=>[2305,2307,2688,6053].includes(Number(d.code))),false,JSON.stringify(result.diagnostics));
  });
}

test('22.07 wrong export or missing library is infrastructure, not a mutation kill',()=>{
  const unresolved=check('export type Result<T>={ok:true;value:T}|{ok:false;error:string};export declare class Client{}');
  assert.equal(unresolved.diagnostics.some(d=>[2305,2307,2688,6053].includes(Number(d.code))),true);
  const missingLib=checkTypes({files:[{path:'tipos.test.ts',content:suite},{path:'index.d.ts',content:reference},config],entryPaths:['tipos.test.ts'],tsconfigPath:'tsconfig.json'},{libraries:{}});
  assert.equal(missingLib.supported,false);
});

test('22.09 isolated declaration package builds with native TypeScript and emits public signatures',async()=>{
  const temp=await mkdtemp(path.join(os.tmpdir(),'devpath-22-09-'));
  try{
    const project=path.join(temp,'project'),out=path.join(temp,'dist');
    await cp('course-src/solutions/22.09',project,{recursive:true});
    const tsc=path.resolve('node_modules/typescript/bin/tsc');
    for(const args of [['--noEmit','--project',path.join(project,'tsconfig.json')],['--project',path.join(project,'tsconfig.json'),'--outDir',out]]){
      const result=spawnSync(process.execPath,[tsc,...args],{encoding:'utf8',timeout:120000,windowsHide:true});
      assert.equal(result.error,undefined,result.error?.message);
      assert.equal(result.status,0,`${result.stdout}\n${result.stderr}`);
    }
    const declaration=await readFile(path.join(out,'index.d.ts'),'utf8');
    for(const name of ['VERSAO','criarSlug','padroes','limitar','Opcoes'])assert.match(declaration,new RegExp(`\\b${name}\\b`));
    assert.match(declaration,/criarSlug\(texto: string\): string/);
    assert.match(declaration,/limitar\(texto: string, maximo\?: number\): string/);
    assert.match(declaration,/padroes: Opcoes/);
    const options=await readFile(path.join(out,'interno.d.ts'),'utf8');
    assert.match(options,/separador: string/);
    assert.match(options,/maximo: number/);
    assert.doesNotMatch(declaration,/prefixo|max: 80|limitar\(centavos/);
  }finally{await rm(temp,{recursive:true,force:true});}
});
