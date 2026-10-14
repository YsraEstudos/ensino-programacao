export const analises = [
  {trecho: "acesso por índice", crescimento: "O(1)"},
  {trecho: "uma varredura", crescimento: "O(n)"},
  {trecho: "dois laços aninhados", crescimento: "O(n²)"},
  {trecho: "dividir por dois", crescimento: "O(log n)"},
  {trecho: "ordenar", crescimento: "O(n log n)"},
  {trecho: "busca binária", crescimento: "O(log n)"},
  {trecho: "Set.has médio", crescimento: "O(1)"},
  {trecho: "copiar n itens", crescimento: "O(n)"},
];

console.log(JSON.stringify(analises));
