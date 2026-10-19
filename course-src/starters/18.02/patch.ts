export type Perfil = { nome: string; tema: "claro" | "escuro" };
export type Usuario = { id: number; nome: string; perfil: Perfil };

// Tarefa: substitua any por um contrato parcial raso e preserve o tipo de T.
export function aplicarPatch<T extends object>(base: T, patch: any): T {
  return { ...base, ...patch };
}

const ana: Usuario = { id: 1, nome: "Ana", perfil: { nome: "Pessoal", tema: "claro" } };
const atualizado = aplicarPatch(ana, { nome: "Bia" });
// Typecheck esperado: atualizado continua Usuario; patch { id: "1" } deve ser rejeitado.
