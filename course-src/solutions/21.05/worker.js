import { contarPrimos } from './primos.js';

self.addEventListener('message', ({data}) => {
  const {id, n} = data || {};
  try {
    const result = contarPrimos(n);
    self.postMessage({id, result});
  } catch (error) {
    self.postMessage({id, error: error instanceof Error ? error.message : String(error)});
  }
});
