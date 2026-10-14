import { carregar } from './profile.js';

describe('carregar perfil', () => {
  test('retorna o dado resolvido', async () => { const data = { nome: 'Ana' }; /*@case 12.05.retorna-o-dado-resolvido-b7e44ed6*/expect(await carregar(() => Promise.resolve(data))).toBe(data); });
  test('usa fallback em rejeição assíncrona', async () => { /*@case 12.05.usa-fallback-em-rejeicao-ass-8e3da4c6*/expect(await carregar(() => Promise.reject(new Error('offline')))).toEqual({ nome: 'offline' }); });
  test('captura throw síncrono', async () => { /*@case 12.05.captura-throw-sincrono-2004ae2d*/expect(await carregar(() => { throw new Error('offline'); })).toEqual({ nome: 'offline' }); });
  test('não devolve Promise como dado de sucesso', async () => { const value = await carregar(() => Promise.resolve({ nome: 'ok' })); /*@case 12.05.nao-devolve-promise-como-dad-b5146e7f*/expect(value instanceof Promise).toBe(false); });
});
