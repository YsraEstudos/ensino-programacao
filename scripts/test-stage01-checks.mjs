import {withPublicDependencies} from './public-test-source.mjs';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
const root = new URL('../public/', import.meta.url);
const ctx = vm.createContext({ console });
for (const name of ['js-stage01-runner.js', 'js-stage01-checks.js']) {
  if (existsSync(new URL(name, root))) vm.runInContext(withPublicDependencies(readFileSync(new URL(name, root), 'utf8')), ctx);
}
export const solutions = {
  '01.01': 'console.log(typeof 42); console.log(typeof "42"); console.log(typeof true); console.log(typeof undefined); console.log(typeof null);',
  '01.02': 'const base = 2; let total = base; total = total + 3; console.log(base,total);',
  '01.03': 'const nome="Lia"; const idade=20; const ativo=true; console.log(nome,idade,ativo);',
  '01.04': 'const nome="Ana"; let pontos=0; pontos=5; const ativo=false; let volume=0; volume=7; const idioma="pt-BR"; let tentativas=1; tentativas=2; console.log(nome,pontos,ativo,volume,idioma,tentativas);',
  '01.05': 'console.log(typeof NaN); console.log(typeof Infinity); console.log(typeof 1n); console.log(typeof null);',
  '01.06': 'const nome="Nara"; const nivel=3; const perfil=`${nome}: nível ${nivel}`; console.log(perfil);',
  '01.07': 'const horas=2; const minutos=15; const resumo=`${horas}h${minutos}`; console.log(resumo);',
  '01.08': 'const jogo="Arena"; let volume=0; const dificuldade="normal"; const legendas=false; const idioma="pt-BR"; console.log(`${jogo} | volume ${volume} | ${dificuldade} | legendas ${legendas} | ${idioma}`); volume=7; console.log(`${jogo} | volume ${volume} | ${dificuldade} | legendas ${legendas} | ${idioma}`);',
  '01.09': 'const nome="Iris"; const nivel=1; let vida=10; const status="ativa"; console.log(`${nome} | nível ${nivel} | vida ${vida} | ${status}`); vida=6; console.log(`${nome} | nível ${nivel} | vida ${vida} | ${status}`); vida=0; console.log(`${nome} | nível ${nivel} | vida ${vida} | ${status}`);',
};
test('Etapa01 has a working contract checker', () => assert.equal(typeof ctx.DevPathStage01Checks?.check, 'function'));
test('01.06 accepts the single interpolated expression requested by the prompt',()=>{
  const result=ctx.DevPathStage01Checks.check('01.06','const nome="Nara"; const nivel=3; console.log(`${nome}: nível ${nivel}`);');
  assert.equal(result.ok,true,result.message);
});
for (const [id, code] of Object.entries(solutions)) test(`${id}: intended solution passes all public cases`, () => {
  const result=ctx.DevPathStage01Checks.check(id,code,{order:['A','B','C','D'],secondOrder:'C B A D'});
  assert.equal(result.ok,true,result.message);
  assert(result.results.length>0);
});
test('01.07 rejects a constant output that ignores the inputs',()=>assert.equal(ctx.DevPathStage01Checks.check('01.07','const horas=2; const minutos=15; const resumo="2h15"; console.log(resumo);').ok,false));
test('01.09 rejects a stale derived string and preserves zero in a passing program',()=>{
  const stale='const nome="Iris"; const nivel=1; let vida=10; const status="ativa"; const ficha=`${nome} | nível ${nivel} | vida ${vida} | ${status}`; console.log(ficha); vida=6; console.log(ficha); vida=0; console.log(ficha);';
  assert.equal(ctx.DevPathStage01Checks.check('01.09',stale).ok,false);
});
test('01.03 accepts independent permutations, rejects repeated orders and diagnostic block',()=>{
  assert.equal(ctx.DevPathStage01Checks.check('01.03',solutions['01.03'],{order:['C','A','B','D'],secondOrder:'B C A D'}).ok,true);
  assert.equal(ctx.DevPathStage01Checks.check('01.03',solutions['01.03'],{order:['A','B','C','D'],secondOrder:'A B C D'}).ok,false);
  assert.equal(ctx.DevPathStage01Checks.check('01.03',solutions['01.03'],{order:['A','B','C','D','E'],secondOrder:'B C A D'}).ok,false);
});
test('01.04 rejects let everywhere even when the output matches',()=>assert.equal(ctx.DevPathStage01Checks.check('01.04',solutions['01.04'].replaceAll('const ','let ')).ok,false));
test('runtime failure and code from a different exercise never pass',()=>{
  assert.equal(ctx.DevPathStage01Checks.check('01.09','const vida=10; vida=6;').ok,false);
  assert.equal(ctx.DevPathStage01Checks.check('01.06',solutions['01.07']).ok,false);
});
