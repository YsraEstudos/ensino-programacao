// Falha esperada: o grafo tem top-level await, e require() lança ERR_REQUIRE_ASYNC_MODULE.
try {
  require('./comTopLevelAwait.mjs');
  console.log('carregou');
} catch (erro) {
  console.log(erro.code);
}
