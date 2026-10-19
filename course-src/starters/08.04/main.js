export function buscaBinaria(valores, alvo) {
  let inicio = 0;
  let fim = valores.length;
  while (inicio < fim) {
    const meio = Math.floor((inicio + fim) / 2);
    if (valores[meio] < alvo) inicio = meio + 1;
    else fim = meio;
  }
  return inicio < valores.length && valores[inicio] === alvo ? inicio : -1;
}

export function prefixo(valores, fim) {
  return valores.slice(0, fim).reduce((total, valor) => total + valor, 0);
}

export function parComSoma(valores, alvo) {
  let inicio = 0;
  let fim = valores.length - 1;
  while (inicio < fim) {
    const soma = valores[inicio] + valores[fim];
    if (soma === alvo) return [inicio, fim];
    if (soma < alvo) inicio += 1;
    else fim -= 1;
  }
  return null;
}

console.log(buscaBinaria([1, 3, 5, 7], 5), prefixo([2, 4, 6], 2), parComSoma([1, 2, 3, 4], 5));
