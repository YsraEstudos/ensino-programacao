// Troque as três funções por implementações reais.
// suportaPreservacao(json = JSON): devolva true só se json.rawJSON existir e o reviver receber context.source.
// lerIdPreservado(texto): leia o JSON e devolva o id como texto com os dígitos originais.
//   Use o terceiro argumento do reviver (context.source) para obter o texto de origem.
// serializarComId(objeto): serialize o id com JSON.rawJSON, sem convertê-lo para Number.
export function suportaPreservacao(json = JSON) {
  return false;
}

export function lerIdPreservado(texto) {
  return JSON.parse(texto);
}

export function serializarComId(objeto) {
  return JSON.stringify(objeto);
}
