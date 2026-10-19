import {test} from 'node:test'; import assert from 'node:assert/strict'; import {primeiroNome,rotulo,semApelido} from './catalogo.ts';
test('primeiroNome recebe string[] e trata lista vazia',()=>{assert.equal(primeiroNome(['ana','bia']),'ANA');assert.throws(()=>primeiroNome([]),RangeError);});
test('semApelido é função que devolve cópia sem apelido',()=>{const source={nome:'Caneca',apelido:'C'};const result=semApelido(source);assert.deepEqual(result,{nome:'Caneca'});assert.equal(Object.hasOwn(result,'apelido'),false);assert.equal(source.apelido,'C');});
test('rotulo usa fallback e remove espaços do valor escolhido',()=>{assert.equal(rotulo({nome:' Caneca '}),'Caneca');assert.equal(rotulo({nome:'X',apelido:'  Bee  '}),'Bee');});
