// DisposableStack registra recursos e os descarta em ordem inversa ao sair do bloco.
export function criarRecurso(nome, log) {
  return {
    [Symbol.dispose]() {
      log.push(`fechou ${nome}`);
    },
  };
}

export function executarComPilha(nomes, log) {
  using pilha = new DisposableStack();
  for (const nome of nomes) pilha.use(criarRecurso(nome, log));
  log.push('trabalho');
  return log;
}

// Quando o corpo e o descarte falham, SuppressedError guarda o erro do descarte em error
// e a falha original do corpo em suppressed.
export function falhasSuprimidas() {
  try {
    using recurso = {
      [Symbol.dispose]() {
        throw new Error('falha ao fechar');
      },
    };
    throw new Error('falha do trabalho');
  } catch (erro) {
    return {
      nome: erro.name,
      descarte: erro.error.message,
      original: erro.suppressed.message,
    };
  }
}
