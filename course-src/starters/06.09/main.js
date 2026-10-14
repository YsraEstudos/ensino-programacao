// 06.09 · Save de jogo robusto.
// Formato V2 (texto JSON): { "version": 2, "nome": string, "vida": número, "itens": [string] }
// Formato V1 (save antigo, sem itens):  { "version": 1, "nome": string, "vida": número }
// Estado em memória: { nome, vida, itens }   (sem o campo version)
//
// salvar(estado)  -> texto JSON V2 do estado.
// restaurar(texto):
//   V2 válido                          -> estado { nome, vida, itens }
//   V1 válido                          -> estado migrado, com itens = []
//   campo extra no JSON                -> ignorado (não aparece no estado)
//   vida negativa                      -> { status: "invalid" } (não é aceita como estado)
//   texto que não é JSON               -> defaults V2: { nome: "Aventureiro", vida: 10, itens: [] }
// restaurar(salvar(estado)) devolve os mesmos campos e valores.
//
// Em nota separada (sem mudar o esquema): compare JSON para persistência com structuredClone para cópia local,
// e diga como datas futuras, Map e Set seriam representados.

export function salvar(estado) {
  // implemente
}

export function restaurar(texto) {
  // implemente
}
