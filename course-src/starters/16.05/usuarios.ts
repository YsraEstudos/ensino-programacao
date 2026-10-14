// 16.05 · Type predicate para filtrar registros externos.
// O predicate é uma promessa: se ele checar menos do que promete, o compilador confia e o erro aparece em runtime.

export type User = { id: number; name: string };

export function isUser(x: unknown): x is User {
  // implemente: objeto não nulo, não array, id number e name string como propriedades próprias
}

const registros: unknown[] = [
  { id: 1, name: "A" },
  null,
  { id: "2", name: "B" },
  { id: 3, name: 4 },
  [1, "A"],
];

export const usuarios: User[] = registros.filter(isUser);
console.log(usuarios); // esperado: [{ id: 1, name: "A" }]

// Escreva mais quatro valores de teste e justifique cada retorno:
// 1. ___
// 2. ___
// 3. ___
// 4. ___ (dica: um objeto que só herda `id` e `name` de outro: Object.create({ id: 1, name: "X" }))
