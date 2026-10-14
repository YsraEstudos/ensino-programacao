export function normalizar(entrada) {
  const {id, nome} = entrada;
  const usuario = {id, nome: nome.trim()};
  return usuario;
}

console.log(JSON.stringify(normalizar({id: 1, nome: " Ana ", senha: "ignorada"})));
