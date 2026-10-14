// 17.04 · Constraint maior do que o corpo precisa.
// `primeiro` não lê `id`, mas exige que todo item tenha `id`. Refatore e mantenha a constraint só onde ela é usada.

export function primeiro<T extends { id: string }>(xs: T[]): T | undefined {
  return xs[0];
}

export function buscarPorId<T extends { id: string }>(xs: T[], id: string): T | undefined {
  return xs.find((x) => x.id === id);
}

// Hoje falha no typecheck; depois da refatoração deve compilar com tipo number | undefined:
export const n = primeiro([1, 2]);

// Continua funcionando:
export const objeto = primeiro([{ id: "x" }]);
export const achado = buscarPorId([{ id: "x", nome: "A" }], "x");
