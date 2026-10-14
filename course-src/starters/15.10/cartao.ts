// 15.10 · Cartão de produto: literal fresco versus variável.
// Troque `destaque` por um campo de extensão inventado por você antes de rodar `npx tsc --noEmit cartao.ts`.

type CartaoProduto = { nome: string; preco: number };

function exibir(cartao: CartaoProduto): string {
  return `${cartao.nome}: R$ ${cartao.preco}`;
}

// A: literal fresco com campo extra. Previsão: ___
exibir({ nome: "Caneca", preco: 39.9, destaque: true });

// B: o mesmo objeto guardado antes numa variável. Previsão: ___
const emVariavel = { nome: "Caneca", preco: 39.9, destaque: true };
exibir(emVariavel);

// C: satisfies verifica o literal e mantém o tipo inferido. Previsão: ___
const verificado = { nome: "Caneca", preco: 39.9 } satisfies CartaoProduto;
exibir(verificado);

// D: dados de fetch. O compilador não enxerga o JSON; como a aplicação deve tratá-los?
// const recebido: unknown = await (await fetch("/api/produtos/1")).json();
