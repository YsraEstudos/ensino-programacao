import {test} from 'node:test'; import assert from 'node:assert/strict'; import {parseConfig} from './config.ts';
test('usa default apenas quando port está ausente',()=>assert.deepEqual(parseConfig({}),{port:3000}));
test('aceita texto de dígitos nos limites e no meio da faixa',()=>{assert.deepEqual(parseConfig({port:'1'}),{port:1});assert.deepEqual(parseConfig({port:'65535'}),{port:65535});assert.deepEqual(parseConfig({port:'8080'}),{port:8080});});
test('rejeita valor numérico e texto que não representa inteiro permitido',()=>{for(const port of [1,3000,65535,'',' 80','80 ','+80','8e1','1.5','abc','0','65536'])assert.throws(()=>parseConfig({port}),RangeError);});
test('port undefined usa default e entrada que não seja objeto falha',()=>{assert.deepEqual(parseConfig({port:undefined}),{port:3000});for(const raw of [null,undefined,7,'{}'])assert.throws(()=>parseConfig(raw),TypeError);});
