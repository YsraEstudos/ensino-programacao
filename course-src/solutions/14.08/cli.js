export async function executar(comando, repositorio, argumentos = []) {
  if (!repositorio || typeof repositorio[comando] !== 'function') return { status: 'usage', exitCode: 2 };
  if (comando === 'add') { if (!argumentos[0]) return { status: 'usage', exitCode: 2 }; return repositorio.add(argumentos[0]); }
  if (comando === 'remove') return repositorio.remove(argumentos[0]);
  if (comando === 'list') return repositorio.list();
  return { status: 'usage', exitCode: 2 };
}
export async function salvarAtomico(fs, destino, conteudo) { const temporario = `${destino}.tmp`; await fs.writeFile(temporario, conteudo); await fs.rename(temporario, destino); }
