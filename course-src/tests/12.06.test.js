import { criarBusca } from './search.js';

describe('busca com respostas obsoletas', () => {
  test('aborta anterior e mantém resposta nova', async () => {
    const pending = []; const fetcher = (query, options) => new Promise((resolve, reject) => { pending.push({ query, options, resolve, reject }); });
    const buscar = criarBusca(fetcher); const first = buscar('A'); const second = buscar('B');
    /*@case 12.06.aborta-anterior-e-mantem-res-a8829fef*/expect(pending[0].options.signal.aborted).toBe(true); pending[1].resolve('novo'); /*@case 12.06.aborta-anterior-e-mantem-res-aa8a7bda*/expect(await second).toBe('novo'); pending[0].resolve('antigo'); /*@case 12.06.aborta-anterior-e-mantem-res-9a30bd8a*/expect(await first).toBe(null);
  });
  test('ignora AbortError sem exibir falha', async () => { const buscar = criarBusca(() => Promise.reject(Object.assign(new Error('cancelado'), { name: 'AbortError' }))); /*@case 12.06.ignora-aborterror-sem-exibir-919c877b*/expect(await buscar('A')).toBe(null); });
  test('encaminha query e signal para fixture', async () => { let received; const buscar = criarBusca((query, options) => { received = { query, options }; return Promise.resolve(7); }); /*@case 12.06.encaminha-query-e-signal-par-ca3a8f01*/expect(await buscar('texto')).toBe(7); /*@case 12.06.encaminha-query-e-signal-par-f7e1ea95*/expect(received.query).toBe('texto'); /*@case 12.06.encaminha-query-e-signal-par-fe2b7718*/expect(received.options.signal).toBeTruthy(); });
});
