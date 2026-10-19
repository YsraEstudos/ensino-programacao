export function buscarComLimite(fetchFn, url, limiteMs, sinalExterno) {
  if (sinalExterno?.aborted) {
    return Promise.reject(new DOMException('Busca cancelada antes do envio.', 'AbortError'));
  }
  const limite = AbortSignal.timeout(limiteMs);
  const sinal = sinalExterno ? AbortSignal.any([sinalExterno, limite]) : limite;
  return fetchFn(url, {signal: sinal}).then(resposta => resposta.text());
}

export function criarBuscaAtual(fetchFn) {
  let controleAtual = null;
  return async function buscar(url) {
    controleAtual?.abort();
    const controle = new AbortController();
    controleAtual = controle;
    try {
      const texto = await fetchFn(url, {signal: controle.signal}).then(resposta => resposta.text());
      return controle === controleAtual ? texto : undefined;
    } catch (erro) {
      if (controle !== controleAtual) return undefined;
      throw erro;
    }
  };
}

export function adiarResposta() {
  return Promise.withResolvers();
}
