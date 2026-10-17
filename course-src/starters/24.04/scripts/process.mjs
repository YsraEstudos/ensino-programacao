import {spawnSync} from 'node:child_process';
import path from 'node:path';
export function execute(cwd,args,timeout=45000){const env={...process.env};delete env.NODE_TEST_CONTEXT;return spawnSync(process.execPath,args,{cwd,env,encoding:'utf8',timeout,windowsHide:true});}
export function npm(cwd,args){
  const env={...process.env};delete env.NODE_TEST_CONTEXT;
  const key=Object.keys(env).find(x=>x.toLowerCase()==='path')||'PATH';env[key]=path.dirname(process.execPath)+path.delimiter+(env[key]||'');
  if(args.some(arg=>/["\r\n&|<>^%!]/.test(arg)))throw new Error('Unsupported npm argument');
  return process.platform==='win32'?spawnSync(process.env.ComSpec||'cmd.exe',['/d','/s','/c','npm '+args.map(arg=>/\s/.test(arg)?'"'+arg+'"':arg).join(' ')],{cwd,env,encoding:'utf8',timeout:45000,windowsHide:true}):spawnSync('npm',args,{cwd,env,encoding:'utf8',timeout:45000});
}
export function success(result,label){if(result.error||result.signal||result.status!==0){const error=new Error(label+': '+String(result.error||result.stdout)+'\n'+result.stderr);error.code='ARTIFACT_OR_RUNNER_ERROR';throw error;}return result.stdout;}
export function expectedLegacyBreak(result){
  const diagnostic=String(result.stdout||'').trim();
  const expected=/^legacy\.ts\(3,\d+\): error TS2345: Argument of type '(?:number|5)' is not assignable to parameter of type '\{ maximo: number; \}(?: \| undefined)?'\.$/;
  if(result.error||result.signal||result.status!==2||String(result.stderr||'').trim()||!expected.test(diagnostic)){
    const error=new Error('Unexpected legacy compiler result: '+String(result.error||diagnostic)+'\n'+String(result.stderr||''));
    error.code='ARTIFACT_OR_RUNNER_ERROR';throw error;
  }
  return 'expected-breaking-change';
}
