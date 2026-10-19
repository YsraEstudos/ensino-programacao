export async function executar(comando, repositorio) {
  if (comando === 'list') return repositorio.list();
  return process.argv.slice(2);
}

export async function carregarRepositorio(fs, origem) {
  let conteudo;
  try {
    conteudo = await fs.readFile(origem, 'utf8');
  } catch (erro) {
    throw new Error(`Falha ao ler storage ${origem}: ${erro.message}`, { cause: erro });
  }

  let dados;
  try {
    dados = JSON.parse(conteudo);
  } catch (erro) {
    if (!(erro instanceof SyntaxError)) throw erro;
    throw new SyntaxError(`JSON inválido em ${origem}: ${erro.message}`, { cause: erro });
  }

  if (!dados || !Array.isArray(dados.notes) || dados.notes.some(note =>
    !note || typeof note.id !== 'string' || typeof note.text !== 'string')) {
    throw new TypeError(`Estrutura inválida em ${origem}: esperado { notes: [{ id, text }] }`);
  }
  return dados;
}

export async function salvarAtomico(fs, destino, conteudo) {
  const temporario = `${destino}.tmp`;
  await fs.writeFile(temporario, conteudo);
  await fs.rename(temporario, destino);
}
