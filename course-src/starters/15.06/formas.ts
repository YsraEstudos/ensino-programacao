// 15.06 · Tipagem estrutural versus nominal.
// Para cada passo, escreva a previsão antes de rodar `npx tsc --noEmit formas.ts`.

interface A { id: string }
interface B { id: string }

declare const a: A;
declare const b: B;

// Passo 1: atribuição nos dois sentidos. Previsão: ___
export const deAparaB: B = a;
export const deBparaA: A = b;

// Passo 2: mude B.id para number e anote o diagnóstico. Previsão: ___

// Passo 3: literal fresco versus variável intermediária. Previsão: ___
export const fresco: A = { id: "x", extra: true };
const intermediario = { id: "x", extra: true };
export const viaVariavel: A = intermediario;

// Passo 4: membro private compara a declaração de origem, não só a forma. Previsão: ___
class MedidorA { private tag = "medidor"; valor = 0; }
class MedidorB { private tag = "medidor"; valor = 0; }
class Filho extends MedidorA {}
export const cruzado: MedidorB = new MedidorA();
export const herdado: MedidorA = new Filho();
// `private` só existe na verificação; para esconder o campo em runtime, use `#tag`.
