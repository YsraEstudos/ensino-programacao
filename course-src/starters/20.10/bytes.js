// 20.10 · String vira bytes UTF-8.
// Previsão antes de executar: text.length = ___ ; bytes.length = ___

const text = "ação 😀";
const encoder = new TextEncoder();
const bytes = encoder.encode(text);
const decoded = new TextDecoder().decode(bytes);
console.log({ textLength: text.length, byteLength: bytes.length, decoded, igual: decoded === text });

// Entrada UTF-8 inválida: 0xC3 começa um caractere de 2 bytes, mas 0x28 não é continuação válida.
const invalidos = new Uint8Array([0x61, 0xc3, 0x28]);

// Tolerante (padrão): o que aparece no lugar do byte inválido? ___
console.log(new TextDecoder().decode(invalidos));

// Estrito: complete com a opção que transforma a falha em erro.
try {
  console.log(new TextDecoder("utf-8", { ___: true }).decode(invalidos));
} catch (erro) {
  console.log("estrito:", erro.name);
}
