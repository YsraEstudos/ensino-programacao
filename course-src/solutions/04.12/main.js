export function lerJsonSeguro(ler, liberar) {
  try {
    return JSON.parse(ler());
  } catch (erro) {
    if (!(erro instanceof SyntaxError)) throw erro;
    throw new Error(`JSON inválido: ${erro.message}`);
  } finally {
    liberar();
  }
}
