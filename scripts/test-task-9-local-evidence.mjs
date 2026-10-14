import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
// Node binary used for the native checks: DEVPATH_NODE_BIN overrides the runtime running this script.
const node24=process.env.DEVPATH_NODE_BIN || process.execPath;
const ts='node_modules/typescript/bin/tsc';
const commands=[
 ['node-version',[node24,['--version']]],
 ['21.08-native-using',[node24,['--test','course-src/solutions/21.08/native-using.test.mjs']]],
 ['21.08-native-using-node26',[process.execPath,['--test','course-src/solutions/21.08/native-using.test.mjs']]],
 ['22.08-clean-package-consumer',[process.execPath,['scripts/test-task-9-package-22-08.mjs']]],
 ['22.09-source-runtime',[process.execPath,['--experimental-strip-types','--test','course-src/solutions/22.09/src/index.test.ts']]],
 ['22.09-isolatedDeclarations',[process.execPath,[ts,'--project','course-src/solutions/22.09/tsconfig.json','--noEmit']]],
 ['22.07-type-suite-and-22.09-declaration-consumer',[process.execPath,['scripts/test-task-9-typed-suite.mjs']]],
 ['23.07-capstone-reopen-tests',[process.execPath,['--experimental-strip-types','--test','course-src/solutions/23.07/test/reabrir.test.ts']]],
 ['23.07-strict-source-types',[process.execPath,[ts,'--ignoreConfig','--noEmit','--strict','--target','ES2022','--module','NodeNext','--moduleResolution','NodeNext','--allowImportingTsExtensions','course-src/solutions/23.07/src/dominio.ts','course-src/solutions/23.07/src/portas.ts','course-src/solutions/23.07/src/adapters/memoria.ts','course-src/solutions/23.07/src/reabrir.ts']]],
 ['23.08-capstone-versioned-contract',[process.execPath,['--experimental-strip-types','--test','course-src/solutions/23.08/test/contrato.test.ts']]],
 ['23.08-strict-source-types',[process.execPath,[ts,'--ignoreConfig','--noEmit','--strict','--target','ES2022','--module','NodeNext','--moduleResolution','NodeNext','--allowImportingTsExtensions','course-src/solutions/23.08/src/dominio.ts','course-src/solutions/23.08/src/portas.ts','course-src/solutions/23.08/src/adapters/memoria.ts','course-src/solutions/23.08/src/adapters/versao.ts','course-src/solutions/23.08/src/servico.ts']]]
];
const results=commands.map(([name,[exe,args]])=>{const r=spawnSync(exe,args,{cwd:process.cwd(),encoding:'utf8',timeout:120000,windowsHide:true});return{name,command:[exe,...args],exitCode:r.status,error:r.error?.message||null,stdout:r.stdout||'',stderr:r.stderr||''};});
const version=JSON.parse(readFileSync('node_modules/typescript/package.json','utf8')).version;
// Evidence JSON is written only when requested: node scripts/test-task-9-local-evidence.mjs --write-evidence
if(process.argv.includes('--write-evidence')){const out='output/learning-execution/task-9-native-local-results.json';mkdirSync(path.dirname(out),{recursive:true});writeFileSync(out,JSON.stringify({generatedAt:new Date().toISOString(),typescript:version,commands:results},null,2)+'\n');}
for(const r of results)console.log(`${r.name}: ${r.exitCode===0?'PASS':'FAIL'}${r.error?` (${r.error})`:''}`);
if(results.some(r=>r.exitCode!==0))process.exitCode=1;