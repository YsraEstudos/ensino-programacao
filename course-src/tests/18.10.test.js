import {test} from 'node:test'; import assert from 'node:assert/strict'; import {loadUser,handle} from './api.ts';
test('loadUser resolve usuário existente e null para ausência',async()=>{/*@case 18.10.loaduser-resolve-usuario-exi-69f6003b*/assert.deepEqual(await loadUser('u1'),{id:'u1',nome:'Ana'});/*@case 18.10.loaduser-resolve-usuario-exi-120405ce*/assert.equal(await loadUser('u9'),null);});
test('handle mantém resultado de sucesso',()=>/*@case 18.10.handle-mantem-resultado-de-s-62b65524*/assert.deepEqual(handle('ok'),{ok:true,valor:1}));
test('handle mantém resultado de erro',()=>/*@case 18.10.handle-mantem-resultado-de-e-203b25cb*/assert.deepEqual(handle('bad'),{ok:false,erro:'bad'}));
