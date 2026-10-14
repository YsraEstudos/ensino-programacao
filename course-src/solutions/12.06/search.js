export function criarBusca(fetcher) {
  let controllerAtual = null; let sequencia = 0;
  return async function buscar(query) {
    controllerAtual?.abort();
    const controller = new AbortController(); controllerAtual = controller; const atual = ++sequencia;
    try { const value = await fetcher(query, { signal: controller.signal }); return atual === sequencia ? value : null; }
    catch (error) { if (error?.name === 'AbortError' || controller.signal.aborted) return null; throw error; }
  };
}
