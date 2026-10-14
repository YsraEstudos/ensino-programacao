export function caminho(grafo, inicio, fim) {
  if (!grafo.has(inicio) || !grafo.has(fim)) return null;
  const anterior = new Map([[inicio, null]]);
  const fila = [inicio];
  for (let i = 0; i < fila.length; i++) {
    const atual = fila[i];
    if (atual === fim) break;
    for (const vizinho of grafo.get(atual) ?? []) {
      if (anterior.has(vizinho)) continue;
      anterior.set(vizinho, atual);
      fila.push(vizinho);
    }
  }
  if (!anterior.has(fim)) return null;
  const rota = [];
  for (let no = fim; no !== null; no = anterior.get(no)) rota.unshift(no);
  return rota;
}
