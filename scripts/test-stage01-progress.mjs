import assert from 'node:assert/strict';
import {loadTsModule} from './load-ts-module.mjs';
import test from 'node:test';
const stage01Module={exports:loadTsModule('lib/stage01-progress.ts')};
const clean=value=>stage01Module.exports.sanitizeStage01Progress(value);
const state={version:3,code:'console.log(typeof 42);',predictions:['number'],predictionSaved:true,reflection:'O operador retorna o tipo em texto.',passedCode:'console.log(typeof 42);',complete:true,hintLevel:0,order:[],secondOrder:'',transfers:[]};
test('new stage01 state is sanitized independently of legacy history',()=>{
  assert.equal(typeof stage01Module.exports.sanitizeStage01Progress,'function');
  const result=clean({'01.01':state,'02.01':state});
  assert.equal(result['01.01'].complete,true);assert.equal(result['02.01'],undefined);
});
test('editing approved code invalidates sanitized approval',()=>{
  const result=clean({'01.01':{...state,code:'console.log("wrong");'}});
  assert.equal(result['01.01'].passedCode,null);assert.equal(result['01.01'].complete,false);
});
test('malformed arrays and outdated states cannot erase or create completion',()=>{
  assert.equal(clean({'01.01':{...state,version:2}})['01.01'],undefined);
  assert.equal(clean({'01.01':{...state,predictions:null}})['01.01'].complete,false);
  assert.equal(clean({'01.09':state})['01.09'].complete,false);
});
test('strings and counts are bounded and prototype keys rejected',()=>{
  const result=clean(JSON.parse('{"__proto__":{"complete":true},"01.02":{"version":3,"code":"'+ 'x'.repeat(13000)+'","predictions":["'+ 'x'.repeat(900)+'"],"hintLevel":999,"fontSize":999}}'));
  assert.equal(result['01.02'].code.length,12000);assert.equal(result['01.02'].predictions[0].length,400);
  assert.equal(result['01.02'].hintLevel,3);assert.equal(Object.hasOwn(result,'__proto__'),false);
});
