import { contarPrimos } from './primos.js';

const pendentes = new Map();
let proximoId = 0;
let worker = null;
let fechado = false;

if (typeof Worker === 'function') {
  worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
  worker.addEventListener('message', ({data}) => {
    const item = pendentes.get(data?.id);
    if (!item) return;
    pendentes.delete(data.id);
    if (data.error) item.reject(new Error(data.error));
    else item.resolve(data.result);
  });
  worker.addEventListener('error', event => {
    const error = new Error(event.message || 'Falha no worker.');
    for (const item of pendentes.values()) item.reject(error);
    pendentes.clear();
  });
}

export function calcular(n) {
  if (fechado) return Promise.reject(new Error('Worker encerrado.'));
  if (worker === null) return Promise.resolve().then(() => contarPrimos(n));
  const id = ++proximoId;
  return new Promise((resolve, reject) => {
    pendentes.set(id, {resolve, reject});
    worker.postMessage({id, n});
  });
}

export function encerrar() {
  if (fechado) return;
  fechado = true;
  worker?.terminate();
  worker = null;
  const error = new Error('Cálculo cancelado pelo encerramento.');
  for (const item of pendentes.values()) item.reject(error);
  pendentes.clear();
}
