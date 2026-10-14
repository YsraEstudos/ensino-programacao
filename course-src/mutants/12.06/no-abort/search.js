export function criarBusca(fetcher) { return query => fetcher(query, { signal: new AbortController().signal }); }
