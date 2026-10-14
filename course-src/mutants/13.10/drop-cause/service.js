export async function carregarConfiguracao(readFile) { try { return await readFile(); } catch { throw new Error('Falha ao carregar configuração'); } }
