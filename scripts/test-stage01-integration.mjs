import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {JSDOM} from 'jsdom';
import test from 'node:test';
const root=new URL('../public/',import.meta.url);
const settle=async()=>{for(let i=0;i<4;i++)await new Promise(resolve=>setImmediate(resolve));};
test('01.02 actual app route teaches before prediction and loads dedicated controls',async()=>{
  const catalog=JSON.parse(readFileSync(new URL('course-catalog.json',root),'utf8'));
  const dom=new JSDOM(readFileSync(new URL('devpath.html',root),'utf8'),{url:'http://localhost:8011/devpath.html#/javascript/01.02',runScripts:'outside-only'});
  try {
    dom.window.fetch=async url=>({ok:true,json:async()=>url==='/course-catalog.json'?catalog:{progress:{}}});
    for(const name of ['js-stage00-runner.js','js-stage00-ui.js','js-stage00-preparation.js','js-stage02-runner.js','js-stage02-lessons.js','js-stage02-ui.js','js-stage01-runner.js','js-stage01-preparation.js','js-stage01-checks.js','js-stage01-ui.js','js-learning-journey.js','js-diagnostic-preparation.js','js-diagnostic-ui.js','app.js']) {
      if(existsSync(new URL(name,root)))dom.window.eval(readFileSync(new URL(name,root),'utf8'));
    }
    await settle();
    assert(dom.window.document.querySelector('.s01-lesson'),'Stage01 must use dedicated renderer');
    assert(!dom.window.document.body.textContent.includes('A explicaÃ§Ã£o e o editor aparecem depois'));
    assert.equal(dom.window.document.querySelector('#view').hasAttribute('aria-live'),false,'announce results, not a whole new page');
    assert.equal(dom.window.document.querySelectorAll('[data-stage01-prediction]').length,4);
  } finally {dom.window.close();}
});
test('the catalog keeps Stage01 versions and beginner scaffolds',()=>{
  const one=JSON.parse(readFileSync(new URL('course-catalog.json',root),'utf8')).filter(x=>x.stage==='01');
  assert.equal(one.length,9);assert(one.every(x=>x.contentVersion===3));
  assert(one.every(x=>x.preparation.conceptSteps.length>=3 && x.preparation.practiceSteps.length===3));
});
