import assert from 'node:assert/strict';
import {validarPagamento} from './pagamento.js';
import {validarComSchema} from './schema.ts';
const casos = [[{id:'p1',amount:10},true],[{id:'p1',amount:'10'},false],[{id:'p1',amount:Infinity},false],[{id:'p1',amount:NaN},false],[{id:'p1',amount:null},false],[null,false],[{id:'',amount:1},false]];
for (const [valor, aceito] of casos) {
  assert.equal(validarPagamento(valor).ok, aceito, 'guard');
  assert.equal(validarComSchema(valor).ok, aceito, 'schema Zod');
}
console.log('Guard e Zod concordam nos 7 casos.');
