import {setup} from './course-runner-harness.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';

test('runner executes multiline code, preserves script-like text, and reports syntax errors', async () => {
  const env = setup();
  try {
    assert.deepEqual(await env.run('console.log(2 + 3);\nconsole.log("</script><img>");'), {kind: 'result', text: '5\n</script><img>'});
    assert.equal((await env.run('const = ;')).kind, 'error');
    assert.equal(env.workers.size, 0);
    assert.equal(env.w.document.querySelectorAll('iframe').length, 0);
  } finally {env.close();}
});

test('an infinite loop is terminated and does not prevent the next execution', async () => {
  const env = setup();
  try {
    assert.equal((await env.run('while (true) {}', 200)).kind, 'timeout');
    assert.equal(env.workers.size, 0);
    assert.deepEqual(await env.run('console.log("recuperado");'), {kind: 'result', text: 'recuperado'});
  } finally {env.close();}
});

test('output is bounded and cancellation releases the running worker', async () => {
  const env = setup();
  try {
    const output = await env.run('for(let i=0;i<10000;i++) console.log("abcdefghij");');
    assert.equal(output.kind, 'error');
    assert.match(output.text, /Limite de saída/);
    let cancelled;
    const stop = env.w.DevPathCourseRunner.run('while(true){}', kind => {cancelled = kind;});
    stop();
    assert.equal(cancelled, 'cancelled');
    assert.equal(env.workers.size, 0);
  } finally {env.close();}
});

test('foreign sources, wrong tokens and late messages cannot finish an execution', async () => {
  const env = setup();
  try {
    const results=[];
    const stop=env.w.DevPathCourseRunner.run('while(true){}',(kind,text)=>results.push({kind,text}));
    const frame=env.w.document.querySelector('iframe');
    const token=frame.srcdoc.match(/[0-9a-f]{8}-[0-9a-f-]{27}/)[0];
    env.w.dispatchEvent(new env.w.MessageEvent('message',{source:null,data:{token,kind:'result',text:'forged'}}));
    env.w.dispatchEvent(new env.w.MessageEvent('message',{source:frame.contentWindow,data:{token:'wrong',kind:'result',text:'forged'}}));
    assert.equal(results.length,0);
    const source=frame.contentWindow;stop();
    env.w.dispatchEvent(new env.w.MessageEvent('message',{source,data:{token,kind:'result',text:'late'}}));
    assert.equal(results.length,1);assert.equal(results[0].kind,'cancelled');assert.equal(env.workers.size,0);
  } finally {env.close();}
});

test('worker creation failure reports an error and removes the sandbox',async()=>{const env=setup({failWorker:true});try{const result=await env.run('console.log(1)');assert.equal(result.kind,'error');assert.match(result.text,/Worker indisponível/);assert.equal(env.w.document.querySelectorAll('iframe').length,0);}finally{env.close();}});

test('registered tests run after the code and report structured results', async () => {
  const env = setup();
  try {
    const run = code => new Promise(resolve => env.w.DevPathCourseRunner.run(code, (kind, text, tests) => resolve({kind, text, tests})));
    const passing = await run('describe("soma",()=>{test("dois mais dois",()=>expect(2+2).toBe(4));test("listas",()=>expect([1,{a:NaN}]).toEqual([1,{a:NaN}]))});test("erro",()=>expect(()=>{throw new RangeError("x")}).toThrow(RangeError));test("negação",()=>expect(1).not.toBe(2));');
    assert.equal(passing.kind, 'result');
    assert.deepEqual(passing.tests, {passed: 4, failed: 0, total: 4});
    assert.match(passing.text, /✓ soma › dois mais dois/);
    const failing = await run('console.log("saída própria");test("falha",()=>expect([1,2]).toEqual([1,3]));test("ok",()=>expect(true).toBeTruthy());test("não lançou",()=>expect(()=>1).toThrow());');
    assert.equal(failing.kind, 'result');
    assert.deepEqual(failing.tests, {passed: 1, failed: 2, total: 3});
    assert.match(failing.text, /saída própria/);
    assert.match(failing.text, /✗ falha\n {4}esperado \[1,3\]; recebido \[1,2\]/);
    assert.match(failing.text, /nada foi lançado/);
    assert.equal((await run('console.log(1)')).tests, undefined);
  } finally {env.close();}
});
