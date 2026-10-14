// Repositório em memória: devolve cópias para que quem chama não altere o estado guardado.
export function criarRepositorioEmMemoria(iniciais = []) {
  const entregas = iniciais.map((entrega) => ({ ...entrega }));
  return {
    listar: () => entregas.map((entrega) => ({ ...entrega })),
    salvar(entrega) {
      entregas.push({ ...entrega });
    },
  };
}
