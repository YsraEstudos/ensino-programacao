import assert from 'node:assert/strict';
import {cp,mkdtemp,rm,mkdir,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const root=process.cwd(),tmp=await mkdtemp(path.join(os.tmpdir(),'devpath-22-08-'));
const pkg=path.join(tmp,'package'),consumer=path.join(tmp,'consumer');
const run=(command,args,cwd)=>{
  const result=spawnSync(command,args,{cwd,encoding:'utf8',timeout:120000,windowsHide:true,shell:command==='npm.cmd'});
  if(result.error||result.status!==0)throw new Error(`${command} ${args.join(' ')} failed\n${result.error||result.stdout}\n${result.stderr}`);
  return result.stdout.trim();
};
try{
  await cp(path.join(root,'course-src/solutions/22.08'),pkg,{recursive:true});
  const manifest=JSON.parse(await (await import('node:fs/promises')).readFile(path.join(pkg,'package.json'),'utf8'));
  assert.equal(manifest.name,'@curso/centavos');
  assert.equal(manifest.version,'0.1.0');
  assert.equal(manifest.license,'MIT');
  assert.equal(manifest.engines.node,'>=24');
  run('npm.cmd',['test'],pkg);
  run('npm.cmd',['run','build'],pkg);
  const packInfo=JSON.parse(run('npm.cmd',['pack','--json'],pkg));
  const packedFiles=packInfo[0].files.map(file=>file.path).sort();
  for(const file of ['dist/index.js','dist/index.d.ts','LICENSE','README.md'])assert.ok(packedFiles.includes(file),`${file} missing from package`);
  assert.equal(packedFiles.some(file=>file.startsWith('src/')||file.startsWith('scripts/')),false,packedFiles.join('\n'));
  await mkdir(consumer,{recursive:true});
  await writeFile(path.join(consumer,'package.json'),'{}');
  const tgz=path.join(pkg,packInfo[0].filename);
  run('npm.cmd',['install','--offline','--no-save',tgz],consumer);
  const js=path.join(consumer,'main.mjs');
  await writeFile(js,"import {centavosParaTexto,somarCentavos} from '@curso/centavos'; if (somarCentavos([125,75])!==200 || centavosParaTexto(1234)!=='R$ 12,34' || centavosParaTexto(100,'USD')!=='US$ 1,00') throw Error('wrong package-root API'); let rejected=false; try { somarCentavos([1.5]); } catch(e) { rejected=e instanceof RangeError; } if(!rejected) throw Error('missing RangeError');\n");
  run(process.execPath,[js],consumer);
  await writeFile(path.join(consumer,'main.ts'),"import {centavosParaTexto,somarCentavos} from '@curso/centavos'; const answer:number=somarCentavos([125,75] as const); const brl:string=centavosParaTexto(1234); const usd:string=centavosParaTexto(100,'USD'); // @ts-expect-error cents are numbers\nsomarCentavos(['125']); // @ts-expect-error only authored currencies are accepted\ncentavosParaTexto(100,'EUR'); void [answer,brl,usd];\n");
  run(process.execPath,[path.join(root,'node_modules/typescript/bin/tsc'),'--noEmit','--strict','--target','ES2022','--module','NodeNext','--moduleResolution','NodeNext','main.ts'],consumer);
  console.log(JSON.stringify({kind:'passed',package:'@curso/centavos@0.1.0',runtime:'Node '+process.versions.node,temporaryConsumer:true,packedFiles},null,2));
}finally{await rm(tmp,{recursive:true,force:true});}