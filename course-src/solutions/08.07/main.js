export function tracarBfs(grafo, inicio, destino) {
  const fila = [inicio];
  const visitados = new Set([inicio]);
  const anterior = new Map();
  const ordem = [];
  while (fila.length) {
    const atual = fila.shift();
    ordem.push(atual);
    if (atual === destino) break;
    for (const vizinho of grafo.get(atual) ?? []) {
      if (visitados.has(vizinho)) continue;
      visitados.add(vizinho);
      anterior.set(vizinho, atual);
      fila.push(vizinho);
    }
  }
  const caminho = [];
  for (let no = destino; no !== undefined; no = anterior.get(no)) caminho.unshift(no);
  return {ordem, caminho: caminho[0] === inicio ? caminho : null};
}

const grafo = new Map([["A", ["B", "C"]], ["B", ["D"]], ["C", ["D"]], ["D", []]]);
console.log(JSON.stringify(tracarBfs(grafo, "A", "D")));
