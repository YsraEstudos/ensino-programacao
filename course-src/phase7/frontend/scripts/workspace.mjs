import assert from 'node:assert/strict';
import {cpSync,readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {classify} from './result.mjs';
export const fixture=fileURLToPath(new URL('../',import.meta.url));
export const node=process.env.DEVPATH_NODE||process.execPath;
export function environment(){
  const env={...process.env,PLAYWRIGHT_BROWSERS_PATH:path.join(fixture,'.browsers'),P7_REPORTER:path.join(fixture,'scripts/browser-reporter.mjs')};delete env.NODE_TEST_CONTEXT;
  const key=Object.keys(env).find(key=>key.toLowerCase()==='path')||'PATH';env[key]=path.dirname(node)+path.delimiter+(env[key]||'');return env;
}
export function execute(project,args,timeout=45000){return spawnSync(node,args,{cwd:project,env:environment(),encoding:'utf8',timeout,windowsHide:true});}
export function npm(project,args){return process.platform==='win32'?spawnSync(process.env.ComSpec||'cmd.exe',['/d','/s','/c','npm '+args.join(' ')],{cwd:project,env:environment(),encoding:'utf8',timeout:60000,windowsHide:true}):spawnSync('npm',args,{cwd:project,env:environment(),encoding:'utf8',timeout:60000});}
export function build(project){const result=execute(project,['node_modules/typescript/bin/tsc','-p','tsconfig.json']);assert.equal(result.error,undefined,String(result.error));assert.equal(result.status,0,result.stdout+result.stderr);}
export function contracts(project,label,expected){
  const result=execute(project,['--test',`--test-reporter=${pathToFileURL(path.join(fixture,'scripts/reporter.mjs')).href}`,'test/model.test.mjs','test/api.test.mjs','test/maintenance.test.mjs']);
  assert.equal(classify(result,8),expected,`${label}: ${result.stdout}\n${result.stderr}\n${result.error||''}`);console.log(`${label}: ${expected}`);return result;
}
export function browser(project,label,expected='passed',grep){
  const args=['node_modules/playwright/cli.js','test'];if(grep)args.push('--grep',grep);
  const result=execute(project,args,100000);assert.equal(classify(result,grep?1:7),expected,`${label}: ${result.stdout}\n${result.stderr}\n${result.error||''}`);
  console.log(`${label}: ${expected}; browser executed`);console.log(result.stdout);return result;
}
export function reference(project){for(const name of ['model.mjs','storage.mjs'])cpSync(path.join(fixture,'reference',name),path.join(project,'src',name));cpSync(path.join(fixture,'reference/visible.mjs'),path.join(project,'maintenance/visible.mjs'));}
export function mutate(project,relative,from,to){const target=path.join(project,relative),content=readFileSync(target,'utf8');assert.ok(content.includes(from),'Missing mutation target: '+relative);writeFileSync(target,content.replaceAll(from,to));}
