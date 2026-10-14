// 06.08 · Configuração versionada.
// Entrada: texto JSON. Saída: configuração na versão atual (2).
//   v1 = { version: 1, volume }              ->  { version: 2, audio: { volume } }
//   v2 = { version: 2, audio: { volume } }   ->  mantida
//   texto corrompido (JSON inválido) ou sem versão conhecida  ->  { version: 2, audio: { volume: 50 } }
//   v1 sem volume                                              ->  volume padrão 50
//   versão futura (por exemplo 3)                              ->  { status: "unsupported", version: 3 } (não tente migrar)
// Preserve valores válidos, inclusive volume 0. Faça primeiro a matriz de decisões.

export function migrar(texto) {
  // implemente
}
