import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,cpSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {root,pack} from '../scripts/pack.mjs';
import {npm,execute,success,expectedLegacyBreak} from '../scripts/process.mjs';
test('L-41/43: packed declarations, two external consumers, breaking migration and regression',{timeout:150000},async()=>{
  const directory=mkdtempSync(path.join(tmpdir(),'p7-library-contract-'));
  try{
    for(const version of ['1.1.0','2.0.0']){
      const release=pack(root,version,directory);
      assert.deepEqual(release.info.files.map(x=>x.path).sort(),['LICENSE','README.md','dist/index.d.ts','dist/index.js','dist/interno.d.ts','dist/interno.js','package.json'].sort(),'tarball allowlist');
      assert.match(release.declarations,/export declare function criarSlug\(texto: string\): string/);
      assert.match(release.declarations,/Opcoes/);assert.match(release.declarations,/padroes/);
      assert.equal(/maximo\?: number/.test(release.declarations),version==='1.1.0','numeric overload declaration');
      console.log('packed '+version+': '+release.info.filename+'; '+release.info.files.length+' allowlisted files');
      for(const name of ['catalog','report']){
        const consumer=path.join(directory,version+'-'+name);mkdirSync(consumer);
        writeFileSync(path.join(consumer,'package.json'),JSON.stringify({name:'external-'+name,private:true,type:'module'}));
        success(npm(consumer,['install','--offline','--ignore-scripts','--no-audit','--no-fund',release.tarball]),'install real .tgz');
        writeFileSync(path.join(consumer,'api-check.mjs'),`import assert from 'node:assert/strict'; import {VERSAO,padroes,criarSlug,limitar} from '@curso/slug-kit';
assert.equal(VERSAO,${JSON.stringify(version)});assert.deepEqual(padroes,{separador:'-',maximo:60});
assert.equal(criarSlug('  Ação  Clara '),'acao--clara','22.09 whitespace semantics preserved');
assert.equal(limitar('x'.repeat(65)),'x'.repeat(60),'default maximo60');
assert.equal(limitar('abcdef',{maximo:5}),'abcde','object overload');
assert.equal(limitar('abc',{maximo:5}),'abc');assert.equal(limitar('abc',{maximo:0}),'');
${version==='1.1.0'?"assert.equal(limitar('abcdef',5),'abcde','legacy overload');":"assert.throws(()=>limitar('abcdef',5),TypeError,'JS legacy call fails explicitly in2.0');"}\n`);
        semantic(execute(consumer,['api-check.mjs']),'package-root API');
        cpSync(path.join(root,'consumers',name,'main.ts'),path.join(consumer,'main.ts'));
        const compiler=path.join(root,'node_modules/typescript/bin/tsc');
        const args=['--strict','--skipLibCheck','false','--target','ES2022','--module','NodeNext','--moduleResolution','NodeNext','--outDir','out'];
        if(name==='report'){
          cpSync(path.join(root,'consumers/report/legacy.ts'),path.join(consumer,'legacy.ts'));
          const legacy=execute(consumer,[compiler,...args,'legacy.ts']);
          if(version==='1.1.0')success(legacy,'legacy strict compile');
          else {expectedLegacyBreak(legacy);console.log('2.0 old report: expected TS2345 numeric-overload break');}
          // noEmitOnError=false supplies JS for the intentionally unsupported old call.
          if(version==='2.0.0'){
            writeFileSync(path.join(consumer,'old-check.mjs'),"import assert from 'node:assert/strict'; import {relatorio} from './out/legacy.js'; assert.throws(()=>relatorio([{id:'b',titulo:'abcdef'}]),TypeError);\n");
            success(execute(consumer,['old-check.mjs']),'expected runtime break');
          }
        }
        const contract=`import type {Opcoes} from '@curso/slug-kit'; import {VERSAO,padroes,criarSlug,limitar} from '@curso/slug-kit'; const o:Opcoes={separador:'-',maximo:5}; const s:string=limitar(criarSlug('Ação'),{maximo:o.maximo}); const d:string=limitar('a'); const v:string=VERSAO; const m:number=padroes.maximo;\n// @ts-expect-error string limit must be rejected\nlimitar('a','5');\nvoid [s,d,v,m];\n`;
        writeFileSync(path.join(consumer,'contract.ts'),contract);
        success(execute(consumer,[compiler,...args,'main.ts','contract.ts']),'package-root strict NodeNext');
        const check=name==='catalog'?"import {catalogo} from './out/main.js'; assert.deepEqual(catalogo.map(x=>x.id),['a','b']); assert.deepEqual(catalogo.map(x=>x.slug),['acao--clara','cafe-com-leite']);":"import {relatorio} from './out/main.js'; const items=[{id:'b',titulo:'abcdef'},{id:'a',titulo:'zyxwvu'}]; const before=structuredClone(items); const rows=relatorio(items); assert.deepEqual(rows.map(x=>x.resumo),['abcde','zyxwv']); assert.deepEqual(rows.map(x=>x.id),['b','a']); assert.equal(rows[0].origem,items[0]); assert.equal(rows[1].origem,items[1]); assert.deepEqual(items,before);";
        writeFileSync(path.join(consumer,'check.mjs'),"import assert from 'node:assert/strict'; "+check+'\n');
        semantic(execute(consumer,['check.mjs']),name+' consumer');
        if(name==='report'&&version==='1.1.0'){
          writeFileSync(path.join(consumer,'legacy-check.mjs'),readFileSync(path.join(consumer,'check.mjs'),'utf8').replace('./out/main.js','./out/legacy.js'));
          success(execute(consumer,['legacy-check.mjs']),'1.1 legacy regression output/order/identity');
        }
        console.log(version+' '+name+': strict NodeNext and actual package-root runtime passed');
      }
    }
  }finally{assert.equal(path.dirname(path.resolve(directory)),path.resolve(tmpdir()));assert.match(path.basename(directory),/^p7-library-contract-/);rmSync(directory,{recursive:true,force:true});}
});
function semantic(result,label){
  // Only an explicitly identified native assertion can become learner RED.
  if(result.status===1&&!result.error&&!result.signal&&/AssertionError \[ERR_ASSERTION\]/.test(result.stderr)&&!/ERR_MODULE_NOT_FOUND|SyntaxError|TS2307|ENOENT|EACCES|ETIMEDOUT/.test(result.stderr))assert.fail(label+' semantic assertion: '+result.stderr);
  success(result,label+' runtime');
}
