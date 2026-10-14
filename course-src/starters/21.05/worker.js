// worker.js · Recebe { id, n } e responde { id, result } ou { id, error }.
import { contarPrimos } from "./primos.js";

self.addEventListener("message", (evento) => {
  const { id, n } = evento.data;
  // complete: calcule com contarPrimos e responda com postMessage, associando o id;
  // em caso de erro, responda { id, error: mensagem }.
});
