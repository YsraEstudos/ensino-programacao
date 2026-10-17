import {spawnSync} from 'node:child_process';
import {cpSync,mkdtempSync,rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const source=fileURLToPath(new URL('../',import.meta.url));
const temp=mkdtempSync(path.join(os.tmpdir(),'devpath-p7-clean-'));
const run=(exe,args)=>{const result=spawnSync(exe,args,{cwd:temp,stdio:'inherit',shell:process.platform==='win32'});if(result.error)throw result.error;if(result.status!==0)throw new Error(`Cópia limpa falhou: ${exe} ${args.join(' ')} (${result.status}).`);};
try{cpSync(source,temp,{recursive:true,filter:item=>!item.includes(`${path.sep}node_modules`)});run('npm.cmd',['ci','--fetch-retries=0','--fetch-timeout=6000']);run(process.execPath,['scripts/verify-fixtures.mjs']);run('npm.cmd',['run','test:properties']);run('npm.cmd',['run','test:types']);console.log('Cópia limpa concluída. E2E permanece pendente até Chromium instalado.');}finally{rmSync(temp,{recursive:true,force:true});}
