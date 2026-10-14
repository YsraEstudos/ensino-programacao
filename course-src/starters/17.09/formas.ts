// 17.09 · enum, objeto `as const` e o JavaScript emitido.
// Compile com `npx tsc formas.ts --target es2024 --outDir saida` e leia saida/formas.js.
// Para cada declaração, marque: existe em runtime? só existe no typecheck?

export enum Numerico { A, B }
export enum Texto { A = "A", B = "B" }

export const Objeto = { A: "A", B: "B" } as const;
export type Objeto = (typeof Objeto)[keyof typeof Objeto];

// Previsões:
// Numerico emitido: ___ (há mapeamento reverso Numerico[0] === "A"?)
// Texto emitido: ___
// Objeto emitido: ___
// type Objeto emitido: ___
// Node.js 24 roda este arquivo direto (`node formas.ts`)? E com `erasableSyntaxOnly` ligado, o tsc aceita? ___
