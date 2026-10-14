export function criarBusca(fetcher) { return async query => fetcher(query, { signal: new AbortController().signal }); }
