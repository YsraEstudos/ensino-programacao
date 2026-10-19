// No TypeScript 6.0.3 com isolatedDeclarations, um() é uma expressão trivial inferível.
export function um() { return 1; }

// TODO: explique por que tamanho precisa de anotação de retorno antes de emitir .d.ts.
export function tamanho(texto: string) { return texto.length; }
