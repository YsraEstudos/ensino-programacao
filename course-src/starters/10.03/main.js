// 10.03 · Pontos que compartilham um protótipo.
// criarPonto(x, y) devolve um objeto com dados próprios x e y, ligado ao protótipo compartilhado `proto`.
// `mover` mora SÓ no protótipo (herdado): move o próprio ponto somando dx e dy.
// Antes de executar, preveja: mover é propriedade própria ou herdada? Mover um ponto afeta o outro?

const proto = {
  mover(dx, dy) {
    // implemente: altera x e y deste ponto
  },
};

export function criarPonto(x, y) {
  // implemente: use Object.create(proto) e dados próprios
}
