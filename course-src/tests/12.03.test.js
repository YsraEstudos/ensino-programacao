import { carregar } from './main.js';

describe('carregar', () => {
  test('inicia operações independentes antes de aguardar', async () => {
    const started = []; const api = {};
    for (const [name, value] of [['produtos', 1], ['usuarios', 2], ['precos', 3]]) api[name] = () => new Promise(resolve => { started.push(name); setTimeout(() => resolve(value), value === 1 ? 30 : value === 2 ? 10 : 20); });
    const promise = carregar(api); /*@case 12.03.inicia-operacoes-independent-d6daa549*/expect(started).toEqual(['produtos', 'usuarios', 'precos']); /*@case 12.03.inicia-operacoes-independent-e449131b*/expect(await promise).toEqual([1, 2, 3]);
  });
  test('mantém ordem declarada mesmo com conclusão fora de ordem', async () => { const api = { produtos: () => Promise.resolve('p'), usuarios: () => Promise.resolve('u'), precos: () => Promise.resolve('r') }; /*@case 12.03.mantem-ordem-declarada-mesmo-4c005e73*/expect(await carregar(api)).toEqual(['p', 'u', 'r']); });
  test('propaga rejeição', async () => { const failure = new Error('falha'); const api = { produtos: () => Promise.reject(failure), usuarios: () => Promise.resolve(2), precos: () => Promise.resolve(3) }; await /*@case 12.03.propaga-rejeicao-49def331*/expect(carregar(api)).rejects.toBe(failure); });
});
