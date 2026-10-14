// 21.10 · Transferir não é copiar.
// structuredClone com `transfer` usa o mesmo algoritmo de postMessage(valor, [buffer]) para um worker.

const original = new ArrayBuffer(8);
new Uint8Array(original).fill(7);
console.log("antes:", original.byteLength);

// 1. Cópia sem transferência
const copia = structuredClone(original);
new Uint8Array(copia)[0] = 99;
console.log("depois da cópia: original", original.byteLength, "primeiro byte", new Uint8Array(original)[0], "| cópia", copia.byteLength);

// 2. Transferência
const transferido = structuredClone(original, { transfer: [original] });
console.log("depois da transferência: emissor", original.byteLength, "detached?", original.detached, "| destino", transferido.byteLength);

// Previsões antes de executar: ___
// Experimento local com worker: postMessage({ buffer }, [buffer]) e registre byteLength nos dois lados.
// SharedArrayBuffer tem outra semântica (memória compartilhada) e fica fora deste exercício.
