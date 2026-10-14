// 22.01 · O JavaScript que roda de verdade.
// Compare com lib.d.ts: onde a declaração mente sobre este arquivo?

export async function buscarApelido(id) {
  await Promise.resolve();
  return id === "u1" ? "ana" : null;
}

// Experimento (executável aqui):
const resultado = buscarApelido("u9");
console.log("é Promise?", resultado instanceof Promise);
console.log("valor resolvido:", await resultado);
