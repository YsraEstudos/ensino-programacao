export const cParaF = celsius => celsius * 9 / 5 + 32;
export const formatar = fahrenheit => `${fahrenheit} °F`;
export const exibir = celsius => formatar(cParaF(celsius));
