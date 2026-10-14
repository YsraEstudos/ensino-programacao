// 22.03 · Biblioteca JavaScript pequena, sem tipos. Escreva parser.d.ts a partir deste código e dos testes.

export function parse(input) {
  if (typeof input !== "string") throw new TypeError("input precisa ser string");
  const n = Number(input.trim());
  return Number.isFinite(n) ? { ok: true, value: n } : { ok: false, error: `não é número: ${input}` };
}

const ouvintes = new Map();
export function on(evento, listener) {
  if (!ouvintes.has(evento)) ouvintes.set(evento, new Set());
  ouvintes.get(evento).add(listener);
  return () => ouvintes.get(evento).delete(listener);
}

// Testes de runtime (conferem a forma que a declaração precisa descrever):
console.log(parse(" 42 "));  // { ok: true, value: 42 }
console.log(parse("x"));     // { ok: false, error: "não é número: x" }
const remover = on("parse", (r) => console.log("ouviu", r));
console.log(typeof remover); // "function"
