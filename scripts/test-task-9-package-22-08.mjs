import assert from 'node:assert/strict';
import {cp,mkdtemp,rm,mkdir,writeFile,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const root=process.cwd(),tmp=await mkdtemp(path.join(os.tmpdir(),'devpath-22-08-'));
const generated=path.join(tmp,'generated'),pkg=path.join(tmp,'package'),semanticProbe=path.join(tmp,'semantic-probe'),consumer=path.join(tmp,'consumer');
const starterProbe=path.join(tmp,'starter');
const compilerBin=path.join(root,'node_modules','.bin');
const stage22Script=process.env.DEVPATH_STAGE22_SOURCE||path.join(root,'scripts/task-9-stage22.mjs');
const run=(command,args,cwd)=>{
  const childEnv={...process.env,PATH:compilerBin+path.delimiter+process.env.PATH};
  delete childEnv.NODE_TEST_CONTEXT;
  const result=spawnSync(command,args,{cwd,encoding:'utf8',timeout:120000,windowsHide:true,shell:command==='npm.cmd',env:childEnv});
  if(result.error||result.status!==0)throw new Error(`${command} ${args.join(' ')} failed\n${result.error||result.stdout}\n${result.stderr}`);
  return result.stdout.trim();
};
try{
  await mkdir(path.join(generated,'course-src'),{recursive:true});
  await cp(path.join(root,'course-src/assessments.json'),path.join(generated,'course-src/assessments.json'));
  run(process.execPath,[stage22Script],generated);
  await cp(path.join(generated,'course-src/solutions/22.08'),pkg,{recursive:true});
  const manifest=JSON.parse(await readFile(path.join(pkg,'package.json'),'utf8'));
  assert.equal(manifest.name,'@curso/centavos');
  assert.equal(manifest.version,'0.1.0');
  assert.equal(manifest.license,'MIT');
  assert.equal(manifest.engines.node,'>=24');
  // A checked-in declaration can be stale even when the consumer compiles.
  // The old copy-based build fails here because no hand-authored .d.ts is allowed.
  assert.equal((await import('node:fs')).existsSync(path.join(pkg,'src/index.d.ts')),false);
  assert.ok(manifest.devDependencies?.typescript,'native declaration build requires TypeScript');
  assert.equal(manifest.exports['.'].types,'./dist/index.d.ts');
  assert.equal(manifest.exports['.'].default,'./dist/index.js');
  const assessment=JSON.parse(await readFile(path.join(root,'course-src/assessments.json'),'utf8'))['22.08'];
  assert.equal(assessment.entryPath,'src/index.js');
  const starterSource=path.join(root,'course-src/starters/22.08');
  assert.ok((await import('node:fs')).existsSync(path.join(starterSource,assessment.entryPath)),'starter entryPath must exist');
  await cp(starterSource,starterProbe,{recursive:true});
  const starterTests=run('npm.cmd',['test'],starterProbe);
  assert.match(starterTests,/tests 2/,'starter must execute both runtime tests');
  run('npm.cmd',['run','build'],starterProbe);
  const starterDeclaration=await readFile(path.join(starterProbe,'dist/index.d.ts'),'utf8');
  assert.match(starterDeclaration,/export type Moeda\s*=\s*["']BRL["']\s*\|\s*["']USD["']/);
  const packageTests=run('npm.cmd',['test'],pkg);
  assert.match(packageTests,/tests 2/,'reference package must execute both runtime tests');
  run('npm.cmd',['run','build'],pkg);
  const declaration=await readFile(path.join(pkg,'dist/index.d.ts'),'utf8');
  assert.match(declaration,/export type Moeda\s*=\s*["']BRL["']\s*\|\s*["']USD["']/);
  assert.match(declaration,/somarCentavos\(valores:\s*readonly number\[\]\):\s*number/);
  // Changing only the source JSDoc must change the emitted type. A copy-based build keeps the stale declaration.
  await cp(pkg,semanticProbe,{recursive:true});
  const semanticSource=path.join(semanticProbe,'src/index.js');
  const sourceText=await readFile(semanticSource,'utf8');
  assert.ok(sourceText.includes("@typedef {'BRL'|'USD'} Moeda"),'currency typedef probe no longer matches the source');
  await writeFile(semanticSource,sourceText.replace("@typedef {'BRL'|'USD'} Moeda","@typedef {'BRL'|'USD'|'EUR'} Moeda"));
  run('npm.cmd',['run','build'],semanticProbe);
  const semanticDeclaration=await readFile(path.join(semanticProbe,'dist/index.d.ts'),'utf8');
  assert.match(semanticDeclaration,/export type Moeda\s*=\s*["']BRL["']\s*\|\s*["']USD["']\s*\|\s*["']EUR["']/);
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
