import assert from 'node:assert/strict';
import {loadTsModule} from './load-ts-module.mjs';
import test from 'node:test';
{ const site = 'canonical';
  const context={testSanitize:loadTsModule('lib/progress-sanitize.ts').sanitizeUserProgress};
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
