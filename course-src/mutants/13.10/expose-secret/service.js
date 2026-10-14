export async function carregarConfiguracao(readFile) { try { return await readFile(); } catch (erro) { throw new Error(String(erro)); } }
