// 18.07 · Índice por chave desconhecida, com noUncheckedIndexedAccess ligado.
// Rode `npx tsc --noEmit --strict --noUncheckedIndexedAccess usuarios.ts` (numa pasta sem tsconfig.json).
// Trate a ausência sem `!`.

type User = { id: string; nome: string };

const porId: Record<string, User> = {
  u1: { id: "u1", nome: "Ana" },
};

export function nomeDe(id: string): string {
  const usuario = porId[id];
  return usuario.nome;
}

// Escolha a política para id ausente (fallback ou erro explícito) e registre:
// nomeDe("u1") -> "Ana"
// nomeDe("u9") -> ___
// Compile com e sem a flag. O JavaScript emitido muda? ___
