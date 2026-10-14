// A reconstrução precisa aplicar a conversão antes de formatar o valor.
export const exibir = celsius => formatar(celsius);
export const cParaF = celsius => celsius * 9 / 5 + 32;
export const formatar = fahrenheit => `${fahrenheit} °F`;
