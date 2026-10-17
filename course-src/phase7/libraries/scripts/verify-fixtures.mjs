import assert from 'node:assert/strict';
import {mkdtempSync,cpSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import path from 'node:path';
import {fixture,build,contracts,reference,mutate} from './workspace.mjs';
const directory=mkdtempSync(path.join(tmpdir(),'p7-libraries-'));
try{
  cpSync(fixture,directory,{recursive:true,filter:p=>! /^(?:reference|build|artifacts)(?:[\\/]|$)/.test(path.relative(fixture,p))});
  build(directory);contracts(directory,'starter','assertion-failure');
  reference(directory);build(directory);contracts(directory,'reference','passed');
  const mutations=[
    ['slug-spaces','src/index.ts',".replaceAll(' ','-')",''],
    ['legacy-overload','src/index.ts',"typeof opcoes==='number' ? opcoes : opcoes.maximo","typeof opcoes==='number' ? 60 : opcoes.maximo"],
    ['default-limit','src/index.ts',"maximo:60","maximo:59"],
    ['v2-runtime-break-omitted','src/v2.ts',"if(typeof opcoes!=='object'||opcoes===null)throw new TypeError('Use {maximo} em2.0.0');",''],
    ['migration-order','consumers/report/main.ts','return itens.map','return [...itens].reverse().map']
  ];
  for(const [label,file,from,to] of mutations){reference(directory);mutate(directory,file,from,to);build(directory);contracts(directory,label,'assertion-failure');}
  console.log('mutants: 5/5 assertion-failure; real npm pack, tarball installs, strict NodeNext external consumers. Evidence local-declared.');
}finally{assert.equal(path.dirname(path.resolve(directory)),path.resolve(tmpdir()));assert.match(path.basename(directory),/^p7-libraries-/);rmSync(directory,{recursive:true,force:true});}
