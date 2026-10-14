export function aplicar(operacoes) {
  const itens = [];
  const resultados = [];
  for (const operacao of operacoes) {
    const separador = operacao.indexOf(" ");
    const comando = separador === -1 ? operacao : operacao.slice(0, separador);
    const nome = separador === -1 ? "" : operacao.slice(separador + 1);
    if (comando === "adicionar") {
      itens.push(nome);
      resultados.push(true);
    } else if (comando === "remover") {
      const posicao = itens.indexOf(nome);
      if (posicao === -1) resultados.push(false);
      else {
        itens.splice(posicao, 1);
        resultados.push(true);
      }
    } else if (comando === "listar") {
      resultados.push(itens.join("\n"));
    } else {
      throw new RangeError(`operação desconhecida: ${operacao}`);
    }
  }
  return resultados;
}
