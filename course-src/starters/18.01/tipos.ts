// 18.01 · Derive, não replique.
// Cada alias abaixo copia à mão algo que já existe. Troque cada cópia por uma derivação
// e indique a fonte: valor runtime, propriedade de tipo, união de chaves ou função.

export type User = { id: string; nome: string };
export const routes = { home: "/", perfil: "/perfil" };
export function criarPedido(itens: string[]) {
  return { id: crypto.randomUUID(), itens, criadoEm: Date.now() };
}
export const STATUS = ["aberto", "pago", "enviado"] as const;

// Cópias manuais
export type UserId = string;                                   // fonte: ___
export type RouteName = "home" | "perfil";                     // fonte: ___
export type Pedido = { id: string; itens: string[]; criadoEm: number }; // fonte: ___
export type Status = "aberto" | "pago" | "enviado";            // fonte: ___

// Experimento: mude User.id para number. Quais aliases acompanham a mudança depois da sua refatoração? ___
// Quais desses nomes existem em runtime e quais somem no JavaScript emitido? ___
