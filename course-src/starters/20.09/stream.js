// Contrato visível 20.09:
// Exporte criarStream(): {stream:ReadableStream,eventos:Array} e consumirLento(source,wait=0): Promise<{values:number[],eventos:Array}>.
// Leia 1,2,3 e cancele com motivo "consumidor terminou"; cada evento pull registra desiredSize numérico.

// 20.09 · ReadableStream sob um consumidor lento.
// Hipótese antes de executar: quantas vezes pull é chamado antes da primeira leitura, com highWaterMark 2? ___

const events = [];
let produzidos = 0;
const stream = new ReadableStream(
  {
    pull(controller) {
      events.push(`pull (desiredSize=${controller.desiredSize})`);
      controller.enqueue(++produzidos);
    },
    cancel(reason) {
      events.push(`cancel: ${reason}`);
    },
  },
  { highWaterMark: 2 },
);

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const reader = stream.getReader();

await esperar(50);
events.push("consumidor começou");
for (let i = 0; i < 3; i++) {
  const { value } = await reader.read();
  events.push(`leu ${value}`);
  await esperar(50); // consumidor lento
}
await reader.cancel("consumidor terminou");

console.log(events.join("\n"));
// Explique o papel da strategy (highWaterMark) e por que desiredSize muda. Não assuma tempos exatos do scheduler.

// Avaliação visível: implementação pendente
export function criarStream() { /* TODO: retornar {stream,eventos}. */ return {stream: null, eventos: []}; }
export async function consumirLento(source, wait = 0) { /* TODO: ler e cancelar o reader. */ return {values: [], eventos: []}; }
