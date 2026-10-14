import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
const assessment=JSON.parse(readFileSync('course-src/assessments.json','utf8'))['14.07'];
const catalog=JSON.parse(readFileSync('public/course-catalog.json','utf8'));
const card=catalog.find(item=>item.id==='14.07');
test('14.07 requires runtime, official Promise.try source and observed callback timing',()=>{
  assert.equal(assessment.environment,'rubric');
  assert.equal(assessment.checks.includes('rubric'),true);
  assert.equal(assessment.rubric.length>=4,true);
  assert.equal(assessment.rubric.some(line=>/opcional/i.test(line)),false);
  const rubric=assessment.rubric.join(' ').toLowerCase();
  for(const term of ['runtime','versão','data','promise.try','nativ','fallback','microtask']) assert.ok(rubric.includes(term),`required rubric missing ${term}`);
  const transfer=(assessment.transfer.prompt+' '+assessment.transfer.rubric.join(' ')).toLowerCase();
  for(const term of ['runtime','versão','data','promise.try','nativ','fallback','microtask']) assert.ok(transfer.includes(term),`transfer missing ${term}`);
  assert.ok(card.resources.some(value=>/promise\/try/i.test(value)||/promise\.try/i.test(value)),'published card must cite Promise.try documentation');
});
