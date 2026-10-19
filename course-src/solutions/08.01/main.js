export const analises = [
  {trecho: "array[0]", crescimento: "O(1)"},
  {trecho: "for (const item of array) visitar(item)", crescimento: "O(n)"},
  {trecho: "for (const a of array) for (const b of array) comparar(a, b)", crescimento: "O(n²)"},
  {trecho: "while (n > 1) n = Math.floor(n / 2)", crescimento: "O(log n)"},
  {trecho: "array.toSorted(comparar)", crescimento: "O(n log n)"},
  {trecho: "buscaBinaria(array, alvo)", crescimento: "O(log n)"},
  {trecho: "set.has(alvo) no caso médio", crescimento: "O(1) médio"},
  {trecho: "[...array]", crescimento: "O(n)"},
];

console.log(JSON.stringify(analises));
