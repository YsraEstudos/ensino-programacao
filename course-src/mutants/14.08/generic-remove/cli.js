export async function executar(comando, repositorio, argumentos = []) { if (comando === 'add') return repositorio.add(argumentos[0]); if (comando === 'list') return repositorio.list(); if (comando === 'remove') throw new Error('not found'); return { status: 'usage' }; }
export async function salvarAtomico(fs, destino, conteudo) { await fs.writeFile(destino, conteudo); }
