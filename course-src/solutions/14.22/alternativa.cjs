// Alternativa para módulo com top-level await: import() é assíncrono e devolve o namespace.
import('./comTopLevelAwait.mjs').then(modulo => console.log(modulo.valor));
