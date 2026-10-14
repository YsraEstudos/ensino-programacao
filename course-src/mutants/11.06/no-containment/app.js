export function montarDelegacao(lista, removerPorId) {
  document.addEventListener('click', event => {
    const botao = event.target?.closest?.('button[data-id]');
    if (botao?.dataset?.id) removerPorId(botao.dataset.id);
  });
}
