// Separe a leitura do arquivo (efeito colateral) da validação pura de loadConfig.
export function carregarEnvArquivo(caminho) {
  process.loadEnvFile(caminho);
}

export function lerConfig(env) {
  const porta = env.PORTA ?? '3000';
  if (!/^\d+$/.test(porta)) throw new RangeError(`PORTA inválida: ${porta}`);
  return { porta: Number(porta), modo: env.MODO ?? 'producao' };
}
