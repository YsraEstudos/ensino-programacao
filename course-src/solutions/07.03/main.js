export function ranking(partidas) {
  return partidas
    .filter(partida => partida.valida)
    .map(partida => ({id: partida.id, jogador: partida.jogador, pontos: partida.pontos}))
    .sort((a, b) => b.pontos - a.pontos || a.jogador.localeCompare(b.jogador, 'pt-BR'))
    .map(partida => partida.id);
}

console.log(JSON.stringify(ranking([
  {id: "a", jogador: "Ana", valida: true, pontos: 8},
  {id: "b", jogador: "Bia", valida: true, pontos: 5},
])));
