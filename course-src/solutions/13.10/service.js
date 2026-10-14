export async function carregarConfiguracao(readFile) {
  try { return await readFile(); }
  catch (erro) { throw new Error('Falha ao carregar configuração', { cause: erro }); }
}
