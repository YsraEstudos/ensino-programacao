export function saudar(nome = 'visitante', saudacao = 'Olá') {
  return `${saudacao}, ${nome}!`;
}

export function somarTudo(...numeros) {
  let total = 0;
  for (const numero of numeros) total += numero;
  return total;
}

export function criarPedido(item, quantidade = 1, desconto = 0) {
  return { item, quantidade, desconto };
}
