export function montarDelegacao(lista, removerPorId) {
  lista.addEventListener('click', event => {
    const alvo = event.target;
    const botao = alvo?.closest?.('button[data-id]');
    if (!botao || !lista.contains(botao)) return;
    const id = botao.dataset?.id;
    if (!id) return;
    removerPorId(id);
  });
}
