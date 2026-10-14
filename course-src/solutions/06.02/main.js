export function observarReferencias() {
  const base = {usuario: {nome: "Ana"}, itens: [1]};
  const alias = base;
  const copia = {...base};
  copia.usuario.nome = "Bia";
  alias.itens.push(2);
  return {base, alias, copia, mesmaRaiz: base === copia, mesmoUsuario: base.usuario === copia.usuario};
}

console.log(JSON.stringify(observarReferencias()));
