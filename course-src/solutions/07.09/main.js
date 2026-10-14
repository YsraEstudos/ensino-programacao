export function analisar(eventos) {
  if (eventos.length === 0) return { duracao: 0, unicas: 0, top: null, taxa: 0 };
  const tempos = eventos.map((evento) => evento.tempo);
  const contagem = new Map();
  let sucessos = 0;
  for (const evento of eventos) {
    contagem.set(evento.acao, (contagem.get(evento.acao) ?? 0) + 1);
    if (evento.resultado === "sucesso") sucessos++;
  }
  let top = null;
  let maior = 0;
  for (const [acao, quantidade] of contagem) {
    if (quantidade > maior) {
      maior = quantidade;
      top = acao;
    }
  }
  return {
    duracao: Math.max(...tempos) - Math.min(...tempos),
    unicas: contagem.size,
    top,
    taxa: sucessos / eventos.length,
  };
}
