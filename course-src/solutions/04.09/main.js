export function ataque(base, nivel) {
  return base + nivel;
}

export function defesa(armadura, nivel) {
  return armadura + Math.floor(nivel / 2);
}

export function resumo(nome, base, nivel, armadura) {
  return `${nome} | ataque ${ataque(base, nivel)} | defesa ${defesa(armadura, nivel)}`;
}
