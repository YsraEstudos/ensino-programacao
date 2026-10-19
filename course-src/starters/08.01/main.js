export const analises = [
  {trecho: "array[0]", crescimento: ""},
  {trecho: "for (const item of array) visitar(item)", crescimento: ""},
  {trecho: "for (const a of array) for (const b of array) comparar(a, b)", crescimento: ""},
  {trecho: "while (n > 1) n = Math.floor(n / 2)", crescimento: ""},
  {trecho: "array.toSorted(comparar)", crescimento: ""},
  {trecho: "buscaBinaria(array, alvo)", crescimento: ""},
  {trecho: "set.has(alvo) no caso médio", crescimento: ""},
  {trecho: "[...array]", crescimento: ""},
];

console.log(JSON.stringify(analises));
