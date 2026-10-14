import {test} from 'node:test'; import assert from 'node:assert/strict'; import {area} from './formas.ts';
test('calcula circle com raio ao quadrado',()=>/*@case 16.07.calcula-circle-com-raio-ao-q-8f9a8bc9*/assert.equal(area({kind:'circle',radius:2}),Math.PI*4));
test('calcula square pelo lado',()=>/*@case 16.07.calcula-square-pelo-lado-9e52e6d7*/assert.equal(area({kind:'square',side:3}),9));
test('calcula triangle com base e altura',()=>/*@case 16.07.calcula-triangle-com-base-e--a7ca049c*/assert.equal(area({kind:'triangle',base:6,height:3}),9));
