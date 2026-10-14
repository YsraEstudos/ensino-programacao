const proto = {
  mover(dx, dy) {
    this.x += dx;
    this.y += dy;
  },
};

export function criarPonto(x, y) {
  const ponto = Object.create(proto);
  ponto.x = x;
  ponto.y = y;
  return ponto;
}
