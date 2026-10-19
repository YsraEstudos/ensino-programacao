// Contrato visível 20.10:
// Exporte medirTexto(text): {textLength:number,byteLength:number,bytes:Uint8Array,decoded:string} e decodificar(bytes,{fatal=false}={}): string.
// byteLength conta UTF-8; UTF-8 inválido lança TypeError no modo fatal e insere U+FFFD no modo padrão.

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

// Avaliação visível: implementação pendente
export function medirTexto(text) { return {textLength:text.length, byteLength:text.length, bytes:new Uint8Array(), decoded:text}; }
export function decodificar(bytes, {fatal=false}={}) { return new TextDecoder("utf-8",{fatal}).decode(bytes); }
