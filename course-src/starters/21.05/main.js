// main.js · Interface: carregue com <script type="module" src="main.js"> por um servidor local.
import { contarPrimos } from "./primos.js";

const pendentes = new Map(); // id -> { resolve, reject }
let proximoId = 0;
let worker = null;

if (typeof Worker === "function") {
  worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
  // complete: ao receber { id, result } ou { id, error }, resolva/rejeite a Promise pendente do mesmo id.
}

export function calcular(n) {
  if (worker === null) {
    // Fallback documentado: roda na thread principal e PODE bloquear a interface.
    return Promise.resolve().then(() => contarPrimos(n));
  }
  const id = ++proximoId;
  return new Promise((resolve, reject) => {
    pendentes.set(id, { resolve, reject });
    worker.postMessage({ id, n });
  });
}

export function encerrar() {
  // complete: terminate no cleanup e rejeite o que ainda estiver pendente.
}

// Experimento: dispare calcular(5_000_000) e calcular(10), e confira que cada resposta volta para a chamada certa.
