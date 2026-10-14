// 19.09 · IDs nominais por convenção (branded types).
// A marca só tem valor se o construtor validar a string antes de aplicá-la.

export type UserId = string & { readonly __brand: "UserId" };
export type OrderId = string & { readonly __brand: "OrderId" };

// Implemente: aceite só /^u\d+$/ e lance RangeError caso contrário.
export function makeUserId(texto: string): UserId {
  // implemente
}

// Implemente: aceite só /^o\d+$/.
export function makeOrderId(texto: string): OrderId {
  // implemente
}

export function getUser(id: UserId): string {
  return `usuário ${id}`;
}

// Type tests:
// getUser(makeUserId("u1"));                 // compila
// getUser(makeOrderId("o1"));                // deve falhar no typecheck
// getUser("u1");                             // deve falhar: string sem validação não recebe marca
// getUser("qualquer" as UserId);             // compila: o cast contorna o checker. O que protege o runtime? ___
// makeUserId("x1")                           // runtime: ___
