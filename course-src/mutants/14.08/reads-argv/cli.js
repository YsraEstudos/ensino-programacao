export async function executar(comando, repositorio) { if (comando === 'list') return repositorio.list(); return process.argv.slice(2); }
export async function salvarAtomico(fs, destino, conteudo) { await fs.writeFile(destino, conteudo); }
