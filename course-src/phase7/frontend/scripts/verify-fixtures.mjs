import assert from 'node:assert/strict';
import {mkdtempSync,cpSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import path from 'node:path';
import {fixture,build,contracts,browser,reference,mutate} from './workspace.mjs';
const directory=mkdtempSync(path.join(tmpdir(),'p7-frontend-'));
try{
  cpSync(fixture,directory,{recursive:true,filter:p=>! /^(?:reference|\.browsers|dist|test-results|playwright-report)(?:[\\/]|$)/.test(path.relative(fixture,p))});
  build(directory);contracts(directory,'starter','assertion-failure');
  reference(directory);contracts(directory,'reference','passed');browser(directory,'reference E2E');
  const mutations=[
    ['latest-request-guard','src/model.mjs','if(current!==generation)return;',''],
    ['cache-removed','src/model.mjs','cache.set(board,structuredClone(tasks));',''],
    ['schema-bypass','src/model.mjs','export function validateTasks(value) {','export function validateTasks(value) { return value;'],
    ['maintenance-regression','maintenance/visible.mjs',"!hideDone||task.status!=='done'",'true'],
  ];
  for(const [label,file,from,to] of mutations){reference(directory);mutate(directory,file,from,to);contracts(directory,label,'assertion-failure');}
  reference(directory);mutate(directory,'src/storage.mjs',"if(event.oldVersion===1&&db.objectStoreNames.contains('cards'))",'if(false)');
  browser(directory,'migration-lost','assertion-failure','IndexedDB');
  console.log('mutants: 5/5 assertion-failure; native HTTP and Chromium E2E executed. Evidence local-declared.');
}finally{assert.equal(path.dirname(path.resolve(directory)),path.resolve(tmpdir()));assert.match(path.basename(directory),/^p7-frontend-/);rmSync(directory,{recursive:true,force:true});}
