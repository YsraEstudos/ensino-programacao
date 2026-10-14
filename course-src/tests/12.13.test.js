import {consumir} from './stream.js';
describe('iteração incremental',()=>{test('expõe cada parcial antes da coleção final',async()=>{const vistos=[];const final=await consumir(parcial=>vistos.push(parcial));/*@case 12.13.expoe-cada-parcial-antes-da--e7fe62fc*/expect(vistos).toEqual([[1],[1,2]]);/*@case 12.13.expoe-cada-parcial-antes-da--dc1fc85f*/expect(final).toEqual([1,2]);});});
