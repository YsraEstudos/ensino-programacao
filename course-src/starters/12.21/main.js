// Implemente as três funções. Os testes chamam cada uma pelo nome exato.
// buscarComLimite(fetchFn, url, limiteMs, sinalExterno): se sinalExterno já estiver abortado, rejeite sem chamar fetchFn;
// senão, combine sinalExterno com AbortSignal.timeout(limiteMs) usando AbortSignal.any e devolva o texto da resposta.
// criarBuscaAtual(fetchFn): cada chamada aborta a anterior; só a chamada mais recente devolve o texto, e as obsoletas devolvem undefined.
// adiarResposta(): devolva { promise, resolve, reject } com Promise.withResolvers().
export function buscarComLimite(fetchFn, url, limiteMs, sinalExterno) {
  return fetchFn(url).then(resposta => resposta.text());
}

export function criarBuscaAtual(fetchFn) {
  return url => fetchFn(url).then(resposta => resposta.text());
}

export function adiarResposta() {
  return {};
}
