const PADRAO = { nome: "Aventureiro", vida: 10, itens: [] };

export function salvar(estado) {
  return JSON.stringify({ version: 2, nome: estado.nome, vida: estado.vida, itens: estado.itens });
}

export function restaurar(texto) {
  let dados;
  try {
    dados = JSON.parse(texto);
  } catch {
    return { ...PADRAO, itens: [] };
  }
  if (typeof dados !== "object" || dados === null || (dados.version !== 1 && dados.version !== 2)) {
    return { ...PADRAO, itens: [] };
  }
  if (typeof dados.vida !== "number" || dados.vida < 0 || typeof dados.nome !== "string") return { status: "invalid" };
  const itens = dados.version === 1 ? [] : Array.isArray(dados.itens) ? [...dados.itens] : [];
  return { nome: dados.nome, vida: dados.vida, itens };
}
