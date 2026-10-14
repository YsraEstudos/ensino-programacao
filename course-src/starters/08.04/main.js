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

console.log(buscaBinaria([1, 3, 5, 7], 5), prefixo([2, 4, 6], 2));
