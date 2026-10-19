export const intencoes = [
  "dobrar todos",
  "manter pares",
  "achar o primeiro",
  "existe negativo?",
  "todos positivos?",
  "somar",
  "transformar nomes",
  "remover vazios",
  "achar id",
  "há ativo?",
  "todos válidos?",
  "calcular produto",
];

export function classificarIntencoes() {
  return Array(intencoes.length).fill("");
}

console.log(JSON.stringify({intencoes, metodos: classificarIntencoes()}));
