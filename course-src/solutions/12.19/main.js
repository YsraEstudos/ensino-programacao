export function montarUrl(base, caminho, parametros) {
  const url = new URL(caminho, base);
  url.search = new URLSearchParams(parametros).toString();
  return url.href;
}

export function lerPagina(textoUrl) {
  const url = new URL(textoUrl);
  const bruto = url.searchParams.get('page');
  const numero = Number(bruto);
  return bruto !== null && Number.isInteger(numero) && numero > 0 ? numero : 1;
}
