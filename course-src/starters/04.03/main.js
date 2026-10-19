// Bloco D: deve executar somente depois de A, B e C.
console.log(exibir(0));

// Blocos A, B e C: as três declarações podem trocar de ordem.
export const formatar = fahrenheit => `${fahrenheit} °F`;
export const cParaF = celsius => celsius * 9 / 5 + 32;
export const exibir = celsius => formatar(cParaF(celsius));
