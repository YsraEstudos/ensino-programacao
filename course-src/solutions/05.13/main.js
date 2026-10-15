export function extrairPares(texto) {
  return [...texto.matchAll(/(?<chave>[a-z_]+)=(?<valor>[^;\s]+)/gi)].map(m => ({chave: m.groups.chave, valor: m.groups.valor}));
}

export function consoantes(texto) {
  return texto.match(/[\p{L}--[aeiouáéíóúâêôãõà]]/giv) || [];
}
