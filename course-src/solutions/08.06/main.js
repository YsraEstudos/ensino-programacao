export function unicosLento(xs) {
  const saida = [];
  for (const x of xs) {
    if (!saida.includes(x)) saida.push(x);
  }
  return saida;
}

export function unicosSet(xs) {
  return [...new Set(xs)];
}
