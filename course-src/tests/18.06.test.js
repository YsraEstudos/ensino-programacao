import {test} from 'node:test'; import assert from 'node:assert/strict'; import {dispatch} from './rotas.ts';
test('dispatch encontra home',()=>/*@case 18.06.dispatch-encontra-home-294960be*/assert.equal(dispatch('home'),'/'));
test('dispatch encontra about',()=>/*@case 18.06.dispatch-encontra-about-c3f2a586*/assert.equal(dispatch('about'),'/about'));
test('paths definidos permanecem distintos',()=>/*@case 18.06.paths-definidos-permanecem-d-c1dfd210*/assert.notEqual(dispatch('home'),dispatch('about')));
