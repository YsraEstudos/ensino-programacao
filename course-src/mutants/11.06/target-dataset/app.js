export function montarDelegacao(lista, removerPorId) { lista.addEventListener('click', event => { const id = event.target.dataset?.id; if (id) removerPorId(id); }); }
