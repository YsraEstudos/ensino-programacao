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

// Para id ausente, inclusive constructor, toString e __proto__, lance RangeError com o id.
// nomeDe("u1") -> "Ana"
// nomeDe("u9") -> RangeError com "u9" na mensagem
// Compile com e sem a flag. O JavaScript emitido muda? ___
