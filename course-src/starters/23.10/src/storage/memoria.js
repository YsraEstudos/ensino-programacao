// Repositório em memória: devolve cópias para que quem chama não altere o estado guardado.
export function criarRepositorioEmMemoria(pedidosIniciais = []) {
  const pedidos = pedidosIniciais.map((pedido) => ({ ...pedido }));
  return {
    listar: () => pedidos.map((pedido) => ({ ...pedido })),
    salvar(pedido) {
      pedidos.push({ ...pedido });
    },
  };
}
