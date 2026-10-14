export function identificadorValido(entrada) {
  const padrao = /^[A-Za-z_][A-Za-z0-9_]*$/;
  return padrao.test(entrada);
}
