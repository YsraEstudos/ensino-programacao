// Contrato visível 21.08:
// A suíte complementar usa usarRecursos(recursos, corpo): Promise<valor>.
// Descarte em LIFO com Symbol.dispose ou Symbol.asyncDispose, aguardando descartes assíncronos.
// Mesmo quando corpo lança, todos os recursos fecham e o erro continua observável.

export async function usarRecursos(recursos, corpo) {
  // TODO: executar corpo e descartar recursos em LIFO, mesmo quando ele lançar.
  return corpo();
}
