import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const records = JSON.parse(readFileSync(new URL('./.generated/resolved_preview.json', import.meta.url)));
const byId = new Map(records.map(item => [item.id, item]));
const code = id => byId.get(id).learner.starter_files[0].content;
function run(source, fixtures = {}) {
  for (const [name, value] of Object.entries(fixtures)) {
    const literal = value === undefined ? 'undefined' : Number.isNaN(value) ? 'NaN' : JSON.stringify(value);
    const declaration = new RegExp(`(const ${name}\\s*=\\s*)[^;]+;`);
    assert(declaration.test(source), `Undeclared fixture: ${name}`);
    source = source.replace(declaration, `$1${literal};`);
  }
  const logs = [];
  vm.runInNewContext(source, { console: { log: (...values) => logs.push(values) } }, { timeout: 1000 });
  return logs;
}

test('02.01: authored blocks preserve values and types', () => {
  const lines = code('02.01').split('\n');
  const outputs = lines.map(line => line.slice(line.indexOf(':', line.indexOf('—')) + 1).replace(/\.$/,'').split(';').map(expr => vm.runInNewContext(expr.trim())));
  assert.deepEqual(outputs, [[14,20,5,2,4,8], [false,true,true,true,false,'x','23'], [false,true,true,false]]);
  assert.equal(typeof outputs[1][5], 'string');
  assert.equal(typeof outputs[1][6], 'string');
});
test('02.02: falsy/nullish matrix includes visible empty string', () => {
  for (const value of [false,0,'',null,undefined,NaN]) {
    assert.equal(value || 'padrão', 'padrão');
    assert.equal(value ?? 'padrão', value == null ? 'padrão' : value);
  }
  assert.match(byId.get('02.02').platform.oracle, /desta tabela/);
});
test('02.03: AND authorizes only both conditions; OR distractor fails', () => {
  const blocks = code('02.03').split('\n').slice(1,5).map(line => line.slice(3)).join('\n');
  for (const [saldo,valor,ativa,expected] of [[10,8,true,true],[8,10,true,false],[10,8,false,false],[0,0,true,true]]) {
    const input = `const saldo=${saldo}; const valor=${valor}; const ativa=${ativa};\n`;
    assert.deepEqual(run(input + blocks), [[expected]]);
    if (!expected) assert.deepEqual(run(input + blocks.replace('suficiente && autorizada', 'suficiente || autorizada')), [[true]]);
  }
});
test('02.04: finite validation rejects empty, NaN and infinities; preserves zero', () => {
  const solution = code('02.04').replace('/* complete */', 'Number(texto)').replace('/* complete */', 'vazio || !Number.isFinite(numero)');
  for (const [texto,vazio,expected] of [['12',false,false],['0',false,false],['',true,true],['   ',true,true],['abc',false,true],['NaN',false,true],['Infinity',false,true],['-Infinity',false,true],['1e309',false,true]]) {
    assert.deepEqual(run(solution, {texto,vazio}), [[expected]]);
  }
  assert.equal(Number.isNaN(Number('Infinity')), false);
});
test('02.05: detection has explicit observable invalid results', () => {
  const solution = code('02.05').replace('const total = quantidade * preco;', 'const quantidadeNumero=Number(quantidade); const precoNumero=Number(preco); const entradaValida=!quantidadeVazia && !precoVazio && Number.isFinite(quantidadeNumero) && Number.isFinite(precoNumero); const total=quantidadeNumero*precoNumero;').replace('total + " reais"', 'String(total) + " reais"').replace('console.log(total, etiqueta)', 'console.log(entradaValida, total, etiqueta)');
  for (const [quantidade,preco,quantidadeVazia,precoVazio,expected] of [
    ['3','10',false,false,[true,30,'30 reais']], ['0','10',false,false,[true,0,'0 reais']],
    ['','10',true,false,[false,0,'0 reais']], ['   ','10',true,false,[false,0,'0 reais']],
    ['3','x',false,false,[false,NaN,'NaN reais']], ['3','Infinity',false,false,[false,Infinity,'Infinity reais']],
    ['3','NaN',false,false,[false,NaN,'NaN reais']],
  ]) assert.deepEqual(run(solution,{quantidade,preco,quantidadeVazia,precoVazio}),[expected]);
});
test('02.06: concrete fixture reproduces bug, fixed fallback preserves present values', () => {
  assert.deepEqual(run(code('02.06')), [[50]]);
  const fixed = code('02.06').replace('||', '??');
  for (const volumeEntrada of [0,false,null,undefined]) assert.deepEqual(run(fixed,{volumeEntrada}), [[volumeEntrada ?? 50]]);
});
test('02.07: MAKE has no supplied formula and valid boundaries match contract', () => {
  assert(!code('02.07').includes('const total'));
  const solution = code('02.07')+'\nconst total=preco*(1-taxa); console.log(total);';
  for (const [preco,taxa,total] of [[100,0.2,80],[50,0,50],[0,0.5,0],[100,1,0]]) assert.deepEqual(run(solution,{preco,taxa}),[[total]]);
});
test('02.08: transfer preserves explicit preferences and replaces absence', () => {
  const solution = code('02.08').replaceAll('||','??');
  assert.deepEqual(run(solution), [[0,'',false]]);
  assert.deepEqual(run(solution,{volumeEntrada:null,temaEntrada:undefined,notificacoesEntrada:null}), [[50,'claro',true]]);
});
test('02.09: optional-score checkpoint handles each declared fixture', () => {
  const item=byId.get('02.09');
  assert.equal(item.kind,'TRANSFER'); assert.equal(item.estimated_minutes,10); assert.equal(item.difficulty.files,1);
  const solution=code('02.09')+'\nconst a=aEntrada??0; const b=bEntrada??0; const total=a+b; console.log(a,b,total);';
  for (const [aEntrada,bEntrada,expected] of [[0,5,[0,5,5]],[undefined,undefined,[0,0,0]],[null,0,[0,0,0]],[3,undefined,[3,0,3]]]) assert.deepEqual(run(solution,{aEntrada,bEntrada}),[expected]);
});
test('02.10: rounding/utilities and deterministic random bounds', () => {
  const solution=code('02.10')+'\nconsole.log(Math.ceil(segundos/60),Math.round(segundos/60),Math.trunc(segundos/60)); console.log(Math.floor(segundosNegativos/60),Math.ceil(segundosNegativos/60),Math.round(segundosNegativos/60),Math.trunc(segundosNegativos/60)); console.log(Math.min(x,y),Math.max(x,y),Math.abs(deslocamento)); const face=Math.floor(sorteio*6)+1; console.log(sorteio,face);';
  for (const [sorteio,face] of [[0,1],[0.25,2],[0.5,4],[0.9999999999999999,6]]) assert.deepEqual(run(solution,{sorteio}),[[1],[2,1,1],[-2,-1,-1,-1],[3,5,3],[sorteio,face]]);
  const randomLog=run(solution).at(-1);
  assert(randomLog[0]>=0 && randomLog[0]<1); assert(Number.isInteger(randomLog[1]) && randomLog[1]>=1 && randomLog[1]<=6);
  assert(Object.is(Math.round(-0.5),-0));
});
test('02.11: exact decimals, approximate decimals, safe integers and bigint', () => {
  assert.deepEqual(run(code('02.11')),[[true],[0.30000000000000004],[false],[true],[false],[true],[false],['bigint']]);
  assert.equal(0.2+0.4===0.6,false);
  assert.equal(Number.isSafeInteger(-(2**53-1)),true);
});
test('02.12: tolerance derives from policy, includes exact boundary and rejects outside', () => {
  const solution=code('02.12')+'\nconst tolerancia=resolucao/2; console.log(tolerancia,Math.abs(a-b)<=tolerancia);';
  for (const [a,b,resolucao,expected] of [[2000.3,2000.304,0.01,[0.005,true]],[1,1.1,0.02,[0.01,false]],[0.1+0.2,0.3,2e-15,[1e-15,true]],[1000.1+1000.2,2000.3,2e-12,[1e-12,true]],[0,0.125,0.25,[0.125,true]],[0,0.25,0.25,[0.125,false]],[4,4,0.01,[0.005,true]]]) assert.deepEqual(run(solution,{a,b,resolucao}),[expected]);
});
test('stage graph names actual skills and prerequisites precede activities', () => {
const graph=JSON.parse(readFileSync(new URL('./.generated/concept_graph.json',import.meta.url)));
  const known=new Set(graph.concepts.map(c=>c.id));
  const learned=new Set(graph.concepts.filter(c=>c.introduced_at==='00' || c.introduced_at==='01').map(c=>c.id));
  for (const item of records) {
    if (item.stage==='02') {
      assert.equal(item.content_version,3);
      for (const required of item.requires) assert(learned.has(required), `${item.id}: prerequisite not demonstrated: ${required}`);
      for (const concept of item.introduces) assert(known.has(concept), `${item.id}: unknown skill ${concept}`);
    }
    for (const concept of item.introduces) learned.add(concept);
  }
  assert(known.has('math.random')); assert(known.has('number.tolerance'));
});
