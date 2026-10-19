// Contrato visível 21.06:
// Exporte criarCache(calcular): {metaDe(node),calculos}; cachePorId(): Map.
// criarCache memoiza por identidade de objeto em WeakMap; cachePorId aceita IDs string.

// 21.06 · Metadados por objeto: WeakMap versus Map.

let calculos = 0;
function calculate(node) {
  calculos++;
  return { profundidade: node.filhos.length, calculadoEm: calculos };
}

const porObjeto = new WeakMap();
function metaDe(node) {
  // complete: devolva do cache se existir; senão calcule, guarde e devolva
}

const a = { filhos: [1, 2] };
const mesmaForma = { filhos: [1, 2] };

metaDe(a);
metaDe(a);
metaDe(mesmaForma);
console.log("cálculos:", calculos); // previsão: ___ (identidade, não forma)

// Chave string em WeakMap:
try {
  porObjeto.set("id-1", {});
} catch (erro) {
  console.log("string como chave:", erro.name); // previsão: ___
}

// Quando o dado tem um ID string estável, qual estrutura usar? O que se perde (tamanho, enumeração)? ___
// Por que não dá para testar de forma determinística que a entrada some após a coleta de lixo? ___

// Avaliação visível: implementação pendente
export function criarCache(calcular) { /* TODO: memoizar por identidade em WeakMap. */ return {metaDe(node) { return calcular(node); }, get calculos() { return 0; }}; }
export function cachePorId() { return new Map(); }
