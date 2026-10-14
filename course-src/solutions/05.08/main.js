export function parseLinhas(linhas) {
  const validas = [];
  const rejeitadas = [];
  for (const linha of linhas) {
    const primeiro = linha.indexOf("|");
    const segundo = primeiro === -1 ? -1 : linha.indexOf("|", primeiro + 1);
    if (segundo === -1) {
      rejeitadas.push(linha);
      continue;
    }
    const nivel = linha.slice(0, primeiro);
    const data = linha.slice(primeiro + 1, segundo);
    const mensagem = linha.slice(segundo + 1);
    if (nivel === "" || data === "" || mensagem === "") rejeitadas.push(linha);
    else validas.push(linha);
  }
  return [validas, rejeitadas];
}
