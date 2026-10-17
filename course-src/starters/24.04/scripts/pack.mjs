import {mkdirSync,writeFileSync,cpSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {npm,success} from './process.mjs';
export const root=fileURLToPath(new URL('../',import.meta.url));
export function pack(project,version,output){
  const staging=path.join(output,'package-'+version);mkdirSync(path.join(staging,'dist'),{recursive:true});
  for(const extension of ['js','d.ts']){
    cpSync(path.join(project,'build',version==='1.1.0'?'index.'+extension:'v2.'+extension),path.join(staging,'dist/index.'+extension));
    cpSync(path.join(project,'build/interno.'+extension),path.join(staging,'dist/interno.'+extension));
  }
  for(const file of ['README.md','LICENSE'])cpSync(path.join(project,file),path.join(staging,file));
  writeFileSync(path.join(staging,'package.json'),JSON.stringify({name:'@curso/slug-kit',version,type:'module',license:'MIT',engines:{node:'>=24.0.0'},exports:{'.':{types:'./dist/index.d.ts',default:'./dist/index.js'}},files:['dist','README.md','LICENSE']},null,2));
  const info=JSON.parse(success(npm(staging,['pack','--json','--ignore-scripts']),'npm pack'))[0];
  const declarations=readFileSync(path.join(staging,'dist/index.d.ts'),'utf8');
  return {tarball:path.join(staging,info.filename),info,declarations,staging};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const output=path.join(root,'artifacts');mkdirSync(output,{recursive:true});
  for(const version of ['1.1.0','2.0.0'])console.log(JSON.stringify(pack(root,version,output).info));
}
