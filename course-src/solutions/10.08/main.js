export function criarEntidade({ id, vida, posicao, capacidades }) {
  return { id, vida, posicao: { x: posicao.x, y: posicao.y }, capacidades: [...capacidades] };
}

export function mover(ent, dx, dy) {
  if (!ent.capacidades.includes("mover")) return { status: "unsupported" };
  ent.posicao.x += dx;
  ent.posicao.y += dy;
  return { status: "ok" };
}

export function receberDano(ent, n) {
  if (!Number.isFinite(n) || n < 0) return false;
  ent.vida = Math.max(0, ent.vida - n);
  return true;
}
