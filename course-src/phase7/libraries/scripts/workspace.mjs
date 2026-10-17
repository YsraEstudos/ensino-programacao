import assert from 'node:assert/strict';
import {cpSync,readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import {execute,success,npm} from './process.mjs';
import {classify} from './result.mjs';
export {npm,execute,success};
export const fixture=fileURLToPath(new URL('../',import.meta.url));
export function build(project){success(execute(project,['node_modules/typescript/bin/tsc','-p','tsconfig.json']),'strict declaration build');}
export function reference(project){for(const file of ['index.ts','v2.ts'])cpSync(path.join(fixture,'reference',file),path.join(project,'src',file));cpSync(path.join(fixture,'reference/report.ts'),path.join(project,'consumers/report/main.ts'));}
export function contracts(project,label,expected){
  const result=execute(project,['--test','--test-reporter='+pathToFileURL(path.join(fixture,'scripts/reporter.mjs')).href,'test/release.test.mjs'],160000);
  assert.equal(classify(result),expected,label+': '+result.stdout+'\n'+result.stderr+'\n'+String(result.error||''));console.log(label+': '+expected);console.log(result.stdout);return result;
}
export function mutate(project,file,from,to){const target=path.join(project,file),content=readFileSync(target,'utf8');assert.ok(content.includes(from),'mutation target '+file);writeFileSync(target,content.replace(from,to));}
