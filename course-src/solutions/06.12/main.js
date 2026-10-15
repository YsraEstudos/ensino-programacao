// Feature detection: o runtime tem JSON.rawJSON e entrega context.source ao reviver?
// json é injetável para que o caminho sem o recurso seja testado sem mudar globais.
export function suportaPreservacao(json = JSON) {
  if (typeof json.rawJSON !== 'function') return false;
  let recebeOrigem = false;
  json.parse('1', (chave, valor, contexto) => {
    if (chave === '') recebeOrigem = contexto?.source === '1';
    return valor;
  });
  return recebeOrigem;
}

export function lerIdPreservado(texto) {
  let id;
  const objeto = JSON.parse(texto, (chave, valor, contexto) => {
    if (chave === 'id') id = contexto.source;
    return valor;
  });
  return { ...objeto, id };
}

export function serializarComId(objeto) {
  return JSON.stringify({ ...objeto, id: JSON.rawJSON(objeto.id) });
}
