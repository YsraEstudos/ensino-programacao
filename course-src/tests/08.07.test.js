import {tracarBfs} from './main.js';

test('BFS usa FIFO, marca a descoberta e reconstrói o primeiro caminho até D', () => {
  const grafo = new Map([['A', ['B', 'C']], ['B', ['D']], ['C', ['D']], ['D', []]]);
  /*@case 08.07.bfs-usa-fifo-marca-a-descobe-59878d56*/expect(tracarBfs(grafo, 'A', 'D')).toEqual({ordem: ['A', 'B', 'C', 'D'], caminho: ['A', 'B', 'D']});
});
