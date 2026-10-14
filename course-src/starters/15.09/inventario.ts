// 15.09 · Duas referências para o mesmo inventário.
// Escreva cada previsão antes de rodar `node inventario.ts` (o Node.js 24 remove os tipos).

const dados = { itens: [1] };
const vista: { readonly itens: number[] } = dados;

// Previsão 1: o que a linha seguinte mostra depois do push feito por `dados`? ___
dados.itens.push(2);
console.log("vista.itens", vista.itens);

// Previsão 2: esta linha compila? O que acontece em runtime? ___
vista.itens.push(3);

// Previsão 3: esta linha compila? ___
// vista.itens = [];

// Previsão 4: as duas referências apontam para o mesmo objeto? ___
console.log("mesmo objeto?", dados === vista, dados.itens);

// Experimento: compare com Object.freeze(dados) (também raso) e explique a diferença
// entre a visão tipada, a identidade e o objeto em runtime.
