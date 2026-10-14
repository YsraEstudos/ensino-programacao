export function normalizar(entrada) {
  const {id, nome} = entrada;
  const usuario = {id, nome: nome.trim(), senha: entrada.senha};
  return usuario;
}

console.log(JSON.stringify(normalizar({id: 1, nome: " Ana ", senha: "ignorada"})));
