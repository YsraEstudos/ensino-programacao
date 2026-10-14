// Compila sem erros por causa de lib.d.ts. O que acontece em runtime?
import { buscarApelido } from "./lib.js";

const apelido = buscarApelido("u1");
console.log(apelido.toUpperCase());

// 1. Liste cada "mentira" da declaração (tipo de retorno, ausência de null).
// 2. Corrija lib.d.ts para Promise<string | null> e veja quais erros aparecem aqui.
// 3. Corrija o consumidor para tratar o caso null.
