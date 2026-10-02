import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import test from 'node:test';
for(const site of ['devpath-full-catalog','devpath-publish']){
  const source=readFileSync(new URL(`../../${site}/app/api/progress/route.ts`,import.meta.url),'utf8').replace(/^import .*;$/gm,'');
  const compiled=ts.transpileModule(source+'\nglobalThis.testSanitize=sanitize;', {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
  const context={exports:{},courseExerciseIds:['02.01','02.04','01.01']};
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../../devpath-publish/lib/stage01-progress.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,context);
  vm.runInNewContext(compiled,context);
  test(`${site}: sanitized server progress preserves long stage02 drafts and checks`,()=>{
    const code='const texto="12";\n'+'// retained\n'.repeat(250);
    const state={version:1,index:0,reflection:'Expliquei como validei a entrada numérica.',complete:true,blocks:[{code,prediction:'Prevejo false.',predictionSaved:true,understood:true,passedCode:code,hintLevel:2,parsons:['A','B','C','D']}]};
    const input={stage02:{'02.04':state},answers:{'01.01':true},completed:['01.01']};
    const saved=context.testSanitize(input);
    assert.equal(saved.stage02['02.04'].blocks[0].code,code);
    assert.equal(saved.stage02['02.04'].blocks[0].passedCode,code);
    assert.equal(saved.stage02['02.04'].complete,true);
    assert.equal(saved.answers['01.01'],true);
    state.blocks[0].code+='console.log(0);';
    const changed=context.testSanitize(input);
    assert.equal(changed.stage02['02.04'].blocks[0].passedCode,null);
    assert.equal(changed.stage02['02.04'].complete,false);
  });
}
