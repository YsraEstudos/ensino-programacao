// 16.07 · Mudança de requisito: acrescentar triângulo.
// 1. Acrescente a variante { kind: "triangle"; base: number; height: number } à union Shape.
// 2. Antes de mexer em `area`, registre o diagnóstico de assertNever.
// 3. Implemente a área como base * height / 2, sem default que devolva 0.

export function assertNever(valor: never): never {
  throw new Error(`Forma não tratada: ${JSON.stringify(valor)}`);
}

export type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number };

export function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.side ** 2;
    default:
      return assertNever(shape);
  }
}

// Casos anteriores e novo:
// area({ kind: "square", side: 3 })                -> 9
// area({ kind: "circle", radius: 1 })              -> Math.PI
// area({ kind: "triangle", base: 6, height: 4 })   -> 12
// area({ kind: "triangle", base: 6 })              -> deve falhar no typecheck
