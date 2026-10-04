await import('../public/js-teaching-utils.js');
import assert from 'node:assert/strict';
await import('../public/js-stage03-runner.js');
const { run, format } = globalThis.DevPathStage03Runner;

function test(name, fn) { try { fn(); console.log(`ok - ${name}`); } catch (error) { console.error(`not ok - ${name}`); throw error; } }

test('runs declarations, logs and flattened values', () => {
  const result = run('let total=0; for(let i=1;i<=3;i++){ total+=i; console.log(i,total); }');
  assert.equal(result.ok, true);
  assert.deepEqual(result.values, [1, 1, 2, 3, 3, 6]);
  assert.deepEqual(result.lines.map(line => line.line), [1, 1, 1]);
});

test('supports fixtures and uninitialized let', () => {
  const result = run('let nota; let faixa="ok"; if(nota>=10) faixa="alta"; console.log(faixa);', { nota: 10 });
  assert.equal(result.ok, true);
  assert.deepEqual(result.values, ['alta']);
});

test('supports continue and break in nested loops', () => {
  const result = run('let soma=0; for(let i=0;i<3;i++){ for(let j=0;j<4;j++){ if(j===1) continue; if(i===1) break; soma++; } } console.log(soma);');
  assert.equal(result.ok, true);
  assert.deepEqual(result.values, [6]);
});

test('preserves const and supports switch cases', () => {
  const result = run('const limite=2; let saida=""; switch(limite){case 1: saida="um"; break; case 2: saida="dois"; break; default: saida="outro";} console.log(saida);');
  assert.equal(result.ok, true);
  assert.deepEqual(result.values, ['dois']);
  assert.match(format(-0), /-0/);
});

test('supports lexical for scope and local shadowing', () => {
  const result = run('let i=9; for(let i=0;i<2;i++){ let x=i; console.log(x); } console.log(i);');
  assert.equal(result.ok, true);
  assert.deepEqual(result.values, [0, 1, 9]);
  assert.equal(result.variables.i, 9);
});

test('bounds non-progress loops by the step or log budget', () => {
  const result = run('let fila=3; while(fila>0){ if(fila===2){console.log("pausa");continue;} fila--; }');
  assert.equal(result.ok, false);
  assert.match(result.error, /progresso|passos|limite.*log/i);
  assert(result.lines.length <= 200);
});

test('rejects unsupported APIs and arrays', () => {
  assert.equal(run('console.log(fetch("x"));').ok, false);
  assert.equal(run('let xs=[];').ok, false);
});

