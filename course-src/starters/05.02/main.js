// 05.02 · Valide a string INTEIRA como identificador ASCII.
// Regra: começa com letra ASCII ou underscore; depois só letras ASCII, dígitos ou underscore.
// Preveja cada caso antes de testar: "abc_2", "_x", "2abc", "", "a-b", "á", "A0" e "abc_2\n".

export function identificadorValido(entrada) {
  const padrao = /___/;
  return padrao.test(entrada);
}
