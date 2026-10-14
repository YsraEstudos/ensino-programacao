export function ranking(partidas) {
  return partidas
    .filter(partida => partida.valida)
    .map(partida => ({id: partida.id, jogador: partida.jogador, pontos: partida.pontos}))
    .sort((a, b) => a.pontos - b.pontos || a.jogador.localeCompare(b.jogador))
    .map(partida => partida.id);
}

console.log(JSON.stringify(ranking([
  {id: "a", jogador: "Ana", valida: true, pontos: 8},
  {id: "b", jogador: "Bia", valida: true, pontos: 5},
])));
