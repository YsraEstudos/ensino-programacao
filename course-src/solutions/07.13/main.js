export function meuReduce(lista, funcao, ...inicial) {
  const temInicial = inicial.length > 0;
  if (!temInicial && lista.length === 0) throw new TypeError('lista vazia sem valor inicial');
  let acumulado = temInicial ? inicial[0] : lista[0];
  for (let indice = temInicial ? 0 : 1; indice < lista.length; indice += 1) {
    acumulado = funcao(acumulado, lista[indice], indice);
  }
  return acumulado;
}
